
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getIndianStates, getDistrictsForState } from "@/lib/locationUtils";

interface ManualLocationEntryProps {
  onLocationSelected: (
    country: string, 
    state: string, 
    district: string
  ) => void;
  initialCountry?: string;
  initialState?: string;
  initialDistrict?: string;
}

export function ManualLocationEntry({ 
  onLocationSelected,
  initialCountry = "India",
  initialState = "",
  initialDistrict = ""
}: ManualLocationEntryProps) {
  const [country] = useState(initialCountry);
  const [state, setState] = useState(initialState || "");
  const [district, setDistrict] = useState(initialDistrict || "");
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update districts when state changes
  useEffect(() => {
    if (state) {
      setIsLoading(true);
      setDistricts([]);
      
      // Small delay to show loading state
      setTimeout(() => {
        const districtList = getDistrictsForState(state);
        setDistricts(districtList);
        setDistrict(""); // Reset district when state changes
        setIsLoading(false);
      }, 300);
    } else {
      setDistricts([]);
    }
  }, [state]);

  // If initialState and initialDistrict are provided, load districts
  useEffect(() => {
    if (initialState && initialDistrict) {
      setState(initialState);
      const districtList = getDistrictsForState(initialState);
      setDistricts(districtList);
      setDistrict(initialDistrict);
    }
  }, [initialState, initialDistrict]);

  const handleSubmit = () => {
    if (state) {
      onLocationSelected(country, state, district);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up border-gray-800 bg-[#222]">
      <CardHeader>
        <CardTitle className="text-2xl text-white text-center">Enter Your Location</CardTitle>
        <CardDescription className="text-center text-gray-300">
          Please select your location to receive relevant alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Country</label>
          <Select disabled value={country}>
            <SelectTrigger className="bg-[#333] text-white border-gray-700">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent className="bg-[#333] text-white border-gray-700">
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">Currently only supporting India</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">State</label>
          <Select 
            value={state} 
            onValueChange={setState}
          >
            <SelectTrigger className="bg-[#333] text-white border-gray-700">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="bg-[#333] text-white border-gray-700">
              {getIndianStates().map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">District</label>
            <Select 
              value={district} 
              onValueChange={setDistrict}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-[#333] text-white border-gray-700">
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  <SelectValue placeholder="Select District" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-[#333] text-white border-gray-700">
                {districts.map((districtName) => (
                  <SelectItem key={districtName} value={districtName}>
                    {districtName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {districts.length === 0 && !isLoading && (
              <p className="text-xs text-gray-400">No districts available for this state</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
          disabled={!state}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
