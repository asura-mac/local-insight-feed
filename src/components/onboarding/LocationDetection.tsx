
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

  const detectLocation = async () => {
    setLoading(true);
    
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
      
      toast.success(
        `Location detected: ${locationData.district || ''} ${locationData.state || ''}, ${locationData.country}`
      );
      
      // Pass location data to parent component
      onLocationDetected(
        locationData.country || 'India',
        locationData.state || '',
        locationData.district || ''
      );
    } catch (error: any) {
      console.error("Location detection error:", error);
      
      toast.error(error.message || "Please enter your location manually");
      
      // Move to manual entry
      onSkip();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Detect Your Location</CardTitle>
        <CardDescription className="text-center">
          We need your location to provide you with relevant alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-blue-50 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </div>

        <p className="text-center text-gray-600">
          Click below to automatically detect your location using your device's GPS.
          This helps us provide alerts specific to your area.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          onClick={detectLocation}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Detecting Location..." : "Detect My Location"}
        </Button>
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full"
          disabled={loading}
        >
          Enter Manually
        </Button>
      </CardFooter>
    </Card>
  );
}
