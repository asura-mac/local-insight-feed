
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { LocationDetection } from "@/components/onboarding/LocationDetection";
import { ManualLocationEntry } from "@/components/onboarding/ManualLocationEntry";
import Header from "@/components/layout/Header";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeviceInfo } from "@/hooks/use-device-info";

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  occupation: z.enum(["Professional", "Self-Employed", "Student", "Other"])
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function Onboarding() {
  const [step, setStep] = useState<"detect" | "manual" | "phone">("detect");
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState<{
    country: string;
    state: string;
    district: string;
    locationString: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deviceInfo } = useDeviceInfo();

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
      occupation: "Professional"
    }
  });

  if (!user) {
    // If no user, redirect will happen through ProtectedRoute
    return null;
  }

  const handleLocationSelected = async (country: string, state: string, district: string) => {
    // Create location string
    const locationString = [district, state, country].filter(Boolean).join(", ");
    
    console.log("Location selected:", { locationString, country, state, district });
    
    // Store location data for the next step
    setLocationData({
      country,
      state,
      district,
      locationString
    });
    
    // Move to phone number step
    setStep("phone");
  };

  const onPhoneSubmit = async (data: PhoneFormValues) => {
    if (!user || !locationData) return;
    
    setLoading(true);
    
    try {
      console.log("Saving user data:", { ...locationData, ...data });
      
      // Format the phone number to ensure it has country code
      let phoneNumber = data.phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        // Default to India country code if no country code provided
        phoneNumber = `+91${phoneNumber}`;
      }
      
      // First check if user record exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error checking user existence:", checkError);
        throw checkError;
      }
      
      let updateError;
      
      if (existingUser) {
        // Update existing user record
        console.log("Updating existing user record");
        const { error } = await supabase
          .from('users')
          .update({
            location: locationData.locationString,
            country: locationData.country,
            state: locationData.state,
            district: locationData.district,
            phone_number: phoneNumber,
            occupation: data.occupation
          })
          .eq('id', user.id);
          
        updateError = error;
      } else {
        // Insert new user record
        console.log("Creating new user record");
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            location: locationData.locationString,
            country: locationData.country,
            state: locationData.state,
            district: locationData.district,
            phone_number: phoneNumber,
            occupation: data.occupation
          });
          
        updateError = error;
      }
      
      if (updateError) {
        console.error("Error saving user data:", updateError);
        throw updateError;
      }
      
      toast.success("Profile saved successfully!");
      
      // Navigate to alerts page
      navigate('/alerts');
    } catch (error: any) {
      console.error("Error saving user data:", error);
      
      toast.error(error.message || "Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "detect":
        return (
          <LocationDetection
            onLocationDetected={handleLocationSelected}
            onSkip={() => setStep("manual")}
          />
        );
      case "manual":
        return (
          <ManualLocationEntry
            onLocationSelected={handleLocationSelected}
            initialCountry="India"
          />
        );
      case "phone":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please provide your phone number and occupation to complete your profile setup.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormDescription>
                        Enter your phone number with country code (e.g., +91 for India)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="+91 1234567890"
                          type="tel"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your occupation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between gap-4 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep("detect")}
                    disabled={loading}
                  >
                    Back to Location
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Saving..." : "Complete Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">Welcome to Alert Hub</h1>
            <p className="mt-2 text-gray-600">Let's set up your profile</p>
          </div>
          
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
}
