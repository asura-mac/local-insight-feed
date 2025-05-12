
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { LocationDetection } from "@/components/onboarding/LocationDetection";
import { ManualLocationEntry } from "@/components/onboarding/ManualLocationEntry";

export default function Onboarding() {
  const [step, setStep] = useState<"detect" | "manual">("detect");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLocationSelected = async (country: string, state: string, district: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create location string
      const locationString = [district, state, country].filter(Boolean).join(", ");
      
      // Save user data in the database
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          location: locationString,
          country,
          state,
          district,
          created_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: "Onboarding complete",
        description: "Your location has been saved successfully",
      });
      
      // Navigate to alerts page
      navigate('/alerts');
    } catch (error: any) {
      console.error("Error saving user data:", error);
      
      toast({
        title: "Error saving your data",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Welcome to Alert Hub</h1>
          <p className="mt-2 text-gray-600">Let's set up your location preferences</p>
        </div>
        
        {step === "detect" ? (
          <LocationDetection
            onLocationDetected={handleLocationSelected}
            onSkip={() => setStep("manual")}
          />
        ) : (
          <ManualLocationEntry
            onLocationSelected={handleLocationSelected}
          />
        )}
      </div>
    </div>
  );
}
