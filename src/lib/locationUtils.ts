
interface GeocodeResult {
  country: string | null;
  state: string | null;
  district: string | null;
  error?: string;
}

// Function to get current position using browser geolocation API
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};

// Function to perform reverse geocoding using coordinates
export const reverseGeocode = async (latitude: number, longitude: number): Promise<GeocodeResult> => {
  try {
    // First try using OpenCage Data API (requires key)
    // If that's not available, fallback to a basic free service
    return await reverseGeocodeWithNominatim(latitude, longitude);
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      country: null,
      state: null,
      district: null,
      error: 'Failed to determine your location. Please enter it manually.'
    };
  }
};

// Function to reverse geocode using Nominatim (OpenStreetMap) - free service
const reverseGeocodeWithNominatim = async (latitude: number, longitude: number): Promise<GeocodeResult> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AlertHub Location Service'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service error');
    }

    const data = await response.json();
    
    // Extract location information
    const address = data.address || {};
    
    // For India, the state might be in state or state_district
    const state = address.state || address.state_district || null;
    
    // District could be in different properties based on the country
    const district = address.county || address.district || address.city || address.town || address.village || null;
    
    return {
      country: address.country || null,
      state,
      district
    };
  } catch (error) {
    console.error('Nominatim geocoding error:', error);
    throw error;
  }
};

// Function to filter Indian states and districts (for dropdown options)
export const getIndianStates = (): string[] => {
  return [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    // Union Territories
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
};

// Check if state is a Union Territory
export const isUnionTerritory = (state: string): boolean => {
  const unionTerritories = [
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  
  return unionTerritories.includes(state);
};

// Function to get districts based on state
export const getDistrictsForState = (state: string): string[] => {
  // This is a simplified version - in production you would want a complete mapping
  // Here we're just showing a few major districts per state as examples
  const districtMap: Record<string, string[]> = {
    'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Visakhapatnam'],
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'South Delhi'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'],
    // For other states, you would add all districts
  };
  
  return districtMap[state] || [];
};
