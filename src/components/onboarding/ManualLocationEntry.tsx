
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
import { indianStates, getDistrictsForState } from "@/lib/locationUtils";

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

  // Update districts when state changes
  useEffect(() => {
    if (state) {
      setDistricts(getDistrictsForState(state));
      setDistrict(""); // Reset district when state changes
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
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Enter Your Location</CardTitle>
        <CardDescription className="text-center">
          Please select your location to receive relevant alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select disabled value={country}>
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Currently only supporting India</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Select 
            value={state} 
            onValueChange={setState}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {indianStates.map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state && districts.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">District</label>
            <Select 
              value={district} 
              onValueChange={setDistrict}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((districtName) => (
                  <SelectItem key={districtName} value={districtName}>
                    {districtName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!state}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
