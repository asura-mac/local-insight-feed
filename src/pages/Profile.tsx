import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { ManualLocationEntry } from "@/components/onboarding/ManualLocationEntry";
import { Tables } from "@/types/database.types";
import { getCurrentPosition, reverseGeocode } from "@/lib/locationUtils";
import { Loader2, MapPin } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Tables<"users"> | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserData(data);
          setPhoneNumber(data.phone_number || '');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  const validatePhoneNumber = (phone: string): boolean => {
    // Allow empty phone number
    if (!phone) return true;
    
    // Basic Indian phone number validation: 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };
  
  const handlePhoneUpdate = async () => {
    if (!user) return;
    
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    
    setPhoneError(null);
    
    try {
      // First check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking user existence:", checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingUser) {
        // Update existing record
        const { error } = await supabase
          .from('users')
          .update({ phone_number: phoneNumber })
          .eq('id', user.id);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            phone_number: phoneNumber
          });
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating phone number:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update phone number",
        variant: "destructive",
      });
    }
  };
  
  const handleLocationUpdate = async (country: string, state: string, district: string) => {
    if (!user) return;
    
    try {
      // Create location string
      const locationString = [district, state, country].filter(Boolean).join(", ");
      
      // First check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking user existence:", checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingUser) {
        // Update existing record
        const { error } = await supabase
          .from('users')
          .update({
            location: locationString,
            country,
            state,
            district,
          })
          .eq('id', user.id);
          
        updateError = error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            location: locationString,
            country,
            state,
            district,
          });
          
        updateError = error;
      }
      
      if (updateError) throw updateError;
      
      setUserData(prev => prev ? {
        ...prev,
        location: locationString,
        country,
        state,
        district,
      } : null);
      
      setShowLocationUpdate(false);
      
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    }
  };
  
  const detectLocation = async () => {
    setDetectingLocation(true);
    
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      console.log("Location coordinates:", { latitude, longitude });
      
      // Get location details using reverse geocoding
      const locationData = await reverseGeocode(latitude, longitude);
      
      if (locationData.error) {
        throw new Error(locationData.error);
      }
      
      if (!locationData.country) {
        throw new Error("Couldn't determine your country");
      }
      
      console.log("Detected location:", locationData);
      
      // Set the location fields for update in ManualLocationEntry component
      setShowLocationUpdate(true);
      
      // Return the detected location data to be used
      handleLocationUpdate(
        locationData.country || 'India',
        locationData.state || '',
        locationData.district || ''
      );
      
      toast({
        title: "Location Detected",
        description: `Location set to ${[
          locationData.district,
          locationData.state,
          locationData.country
        ].filter(Boolean).join(", ")}`,
      });
    } catch (error: any) {
      console.error("Location detection error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not detect location. Please enter manually.",
        variant: "destructive",
      });
      setShowLocationUpdate(true);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: userData?.full_name || '',
          phone_number: phoneNumber,
          location: userData?.location || '',
          country: userData?.country || '',
          state: userData?.state || '',
          district: userData?.district || '',
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-dark-text-primary">Profile Settings</h1>
          </div>

          {message && (
            <Alert className={`mb-6 ${message.type === "success" ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}>
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-dark-border bg-dark-surface">
            <CardHeader>
              <CardTitle className="text-dark-text-primary">Personal Information</CardTitle>
              <CardDescription className="text-dark-text-secondary">
                Update your profile information and location preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-dark-text-primary">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={userData?.full_name || ''}
                      onChange={(e) => setUserData(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      className="bg-dark-surface-light border-dark-border text-dark-text-primary placeholder-dark-text-muted focus:border-dark-accent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-dark-text-primary">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setPhoneError(null);
                      }}
                      className="bg-dark-surface-light border-dark-border text-dark-text-primary placeholder-dark-text-muted focus:border-dark-accent"
                      placeholder="Enter your phone number"
                    />
                    {phoneError && (
                      <p className="text-xs text-[#F44336] mt-1">{phoneError}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Format: 10-digit Indian mobile number (e.g., 9876543210)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-dark-text-primary">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      value={userData?.country || ''}
                      onChange={(e) => setUserData(prev => prev ? { ...prev, country: e.target.value } : null)}
                      className="bg-dark-surface-light border-dark-border text-dark-text-primary placeholder-dark-text-muted focus:border-dark-accent"
                      placeholder="Enter your country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-dark-text-primary">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      value={userData?.state || ''}
                      onChange={(e) => setUserData(prev => prev ? { ...prev, state: e.target.value } : null)}
                      className="bg-dark-surface-light border-dark-border text-dark-text-primary placeholder-dark-text-muted focus:border-dark-accent"
                      placeholder="Enter your state or province"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="district" className="text-dark-text-primary">District/City</Label>
                    <Input
                      id="district"
                      type="text"
                      value={userData?.district || ''}
                      onChange={(e) => setUserData(prev => prev ? { ...prev, district: e.target.value } : null)}
                      className="bg-dark-surface-light border-dark-border text-dark-text-primary placeholder-dark-text-muted focus:border-dark-accent"
                      placeholder="Enter your district or city"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-dark-accent hover:bg-dark-accent-hover text-white"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-dark-border bg-dark-surface mt-6">
            <CardHeader>
              <CardTitle className="text-dark-text-primary">Location</CardTitle>
              <CardDescription className="text-dark-text-secondary">
                Your current location for alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showLocationUpdate ? (
                <ManualLocationEntry 
                  onLocationSelected={handleLocationUpdate}
                  initialCountry={userData?.country || "India"}
                  initialState={userData?.state || ""}
                  initialDistrict={userData?.district || ""}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-dark-text-primary">
                    <strong>Current Location:</strong> {userData?.location || "No location set"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => setShowLocationUpdate(true)}
                      className="bg-dark-accent hover:bg-dark-accent-hover text-white"
                    >
                      Update Location Manually
                    </Button>
                    <Button 
                      onClick={detectLocation}
                      variant="outline"
                      disabled={detectingLocation}
                      className="border-dark-border text-dark-text-primary hover:bg-dark-accent hover:text-white flex items-center"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Autodetect My Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
