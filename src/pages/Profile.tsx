
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

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Tables<"users"> | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  
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
  
  const handlePhoneUpdate = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ phone_number: phoneNumber })
        .eq('id', user.id);
      
      if (error) throw error;
      
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
      
      const { error } = await supabase
        .from('users')
        .update({
          location: locationString,
          country,
          state,
          district,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
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

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="w-full h-8 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-2/3 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="Enter your phone number" 
                  />
                </div>
                <Button onClick={handlePhoneUpdate}>Update Phone</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Your current location for alerts</CardDescription>
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
                    <p className="text-gray-600">
                      <strong>Current Location:</strong> {userData?.location || "No location set"}
                    </p>
                    <Button onClick={() => setShowLocationUpdate(true)}>
                      Update Location
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AppLayout>
  );
}
