import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { LocationDetection } from "@/components/onboarding/LocationDetection";
import { ManualLocationEntry } from "@/components/onboarding/ManualLocationEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeviceInfo } from "@/hooks/use-device-info";
import { Layout } from "@/components/layout/Layout";

const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useDeviceInfo();
  
  const [step, setStep] = useState(1);
  const [locationData, setLocationData] = useState({
    country: "",
    state: "",
    district: "",
  });
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const handleLocationSubmit = async (location: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          country: location.country,
          state: location.state,
          district: location.district,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location updated successfully",
      });

      navigate("/alerts");
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setStep(2);
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
    } catch (error) {
      console.error("Error updating phone:", error);
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card className="border-dark-border bg-dark-surface">
            <CardHeader>
              <CardTitle className="text-gray-900">Phone Number</CardTitle>
              <CardDescription className="text-dark-text-secondary">
                We'll use this to send you emergency alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-900">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="Enter your phone number"
                            className="bg-dark-surface-light border-dark-border text-gray-900 placeholder-dark-text-muted focus:border-dark-accent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-dark-accent hover:bg-dark-accent-hover text-white">
                    Continue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-dark-border bg-dark-surface">
            <CardHeader>
              <CardTitle className="text-gray-900">Location Setup</CardTitle>
              <CardDescription className="text-dark-text-secondary">
                Set your location to receive relevant emergency alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showLocationUpdate ? (
                <ManualLocationEntry
                  onSubmit={handleLocationSubmit}
                  onBack={() => setShowLocationUpdate(false)}
                />
              ) : (
                <LocationDetection
                  onLocationDetected={handleLocationSubmit}
                  onManualEntry={() => setShowLocationUpdate(true)}
                />
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Satark</h1>
            <p className="text-dark-text-secondary">Let's set up your location to receive relevant alerts</p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-dark-accent text-white' : 'bg-dark-surface-light text-dark-text-muted'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${
                step >= 2 ? 'bg-dark-accent' : 'bg-dark-surface-light'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-dark-accent text-white' : 'bg-dark-surface-light text-dark-text-muted'
              }`}>
                2
              </div>
            </div>
          </div>
          
          {renderStepContent()}
        </div>
      </div>
    </Layout>
  );
}
