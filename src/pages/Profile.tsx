
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        </div>

        {loading ? (
          <Card className="border-gray-800 bg-[#222]">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="w-full h-8 bg-gray-700 animate-pulse rounded"></div>
                <div className="w-2/3 h-8 bg-gray-700 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-gray-800 bg-[#222]">
                <CardHeader>
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <CardDescription className="text-gray-400">Your basic account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-[#333] text-white border-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-[#222]">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                  <CardDescription className="text-gray-400">Update your contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number</label>
                    <Input 
                      value={phoneNumber} 
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setPhoneError(null);
                      }}
                      placeholder="Enter your phone number"
                      className="bg-[#333] text-white border-gray-700" 
                    />
                    {phoneError && (
                      <p className="text-xs text-[#F44336] mt-1">{phoneError}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Format: 10-digit Indian mobile number (e.g., 9876543210)
                    </p>
                  </div>
                  <Button 
                    onClick={handlePhoneUpdate}
                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
                  >
                    Update Phone
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-gray-800 bg-[#222]">
                <CardHeader>
                  <CardTitle className="text-white">Location</CardTitle>
                  <CardDescription className="text-gray-400">Your current location for alerts</CardDescription>
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
                      <p className="text-gray-300">
                        <strong>Current Location:</strong> {userData?.location || "No location set"}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={() => setShowLocationUpdate(true)}
                          className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
                        >
                          Update Location Manually
                        </Button>
                        <Button 
                          onClick={detectLocation}
                          variant="outline"
                          disabled={detectingLocation}
                          className="border-gray-700 text-white hover:bg-[#333] hover:text-white flex items-center"
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
