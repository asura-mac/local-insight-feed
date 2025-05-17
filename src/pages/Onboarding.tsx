
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { LocationDetection } from "@/components/onboarding/LocationDetection";
import { ManualLocationEntry } from "@/components/onboarding/ManualLocationEntry";
import { Header } from "@/components/layout/Header";

export default function Onboarding() {
  const [step, setStep] = useState<"detect" | "manual">("detect");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    // If no user, redirect will happen through ProtectedRoute
    return null;
  }

  const handleLocationSelected = async (country: string, state: string, district: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create location string
      const locationString = [district, state, country].filter(Boolean).join(", ");
      
      console.log("Saving user location:", { locationString, country, state, district });
      
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
            location: locationString,
            country,
            state,
            district,
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
            location: locationString,
            country,
            state,
            district,
          });
          
        updateError = error;
      }
      
      if (updateError) {
        console.error("Error saving user data:", updateError);
        throw updateError;
      }
      
      toast.success("Location saved successfully!");
      
      // Navigate to alerts page
      navigate('/alerts');
    } catch (error: any) {
      console.error("Error saving user data:", error);
      
      toast.error(error.message || "Failed to save your location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
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
              initialCountry="India"
            />
          )}
        </div>
      </main>
    </div>
  );
}
