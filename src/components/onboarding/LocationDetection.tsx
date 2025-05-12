
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getCurrentPosition, reverseGeocode } from "@/lib/locationUtils";
import { Loader2Icon, MapPinIcon } from "lucide-react";

interface LocationDetectionProps {
  onLocationDetected: (
    country: string, 
    state: string, 
    district: string
  ) => void;
  onSkip: () => void;
}

export function LocationDetection({ 
  onLocationDetected, 
  onSkip 
}: LocationDetectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    setLoading(true);
    setError(null);
    
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
      
      // Only show success toast if we have meaningful data
      if (locationData.state || locationData.district) {
        toast.success(
          `Location detected: ${[
            locationData.district,
            locationData.state,
            locationData.country
          ].filter(Boolean).join(", ")}`
        );
      } else {
        toast.info("Location detected, but some details are missing");
      }
      
      // Pass location data to parent component
      onLocationDetected(
        locationData.country || 'India',
        locationData.state || '',
        locationData.district || ''
      );
    } catch (error: any) {
      console.error("Location detection error:", error);
      setError(error.message || "Failed to detect your location");
      toast.error(error.message || "Please enter your location manually");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up border-gray-800 bg-[#222]">
      <CardHeader>
        <CardTitle className="text-2xl text-white text-center">Detect Your Location</CardTitle>
        <CardDescription className="text-center text-gray-300">
          We need your location to provide you with relevant alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-[#333] rounded-full">
          <MapPinIcon size={64} className="text-[#D32F2F]" />
        </div>

        <p className="text-center text-gray-300">
          Click below to automatically detect your location using your device's GPS.
          This helps us provide alerts specific to your area.
        </p>

        {error && (
          <div className="w-full p-3 bg-[#F9A825]/20 border border-[#F9A825]/30 rounded-md text-white">
            <p className="font-medium mb-1">Could not detect location</p>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={detectLocation}
          className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Detecting Location...
            </>
          ) : (
            "Detect My Location"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full border-gray-700 text-white hover:bg-[#333] hover:text-white"
          disabled={loading}
        >
          Enter Manually
        </Button>
      </CardFooter>
    </Card>
  );
}
