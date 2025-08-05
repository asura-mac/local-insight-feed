import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/database.types';
import { 
  categorizeAlerts, 
  filterAlertsBySearch, 
  sortAlertsByDate,
  UserLocation,
  CategorizedAlerts 
} from '@/lib/alertUtils';

export interface UseAlertsReturn {
  // Data
  allAlerts: Tables<"alerts">[];
  categorizedAlerts: CategorizedAlerts;
  userLocation: UserLocation | null;
  
  // Loading states
  loading: boolean;
  loadingLocation: boolean;
  
  // Search states
  regionalSearch: string;
  nationalSearch: string;
  internationalSearch: string;
  
  // Filtered results
  filteredRegionalAlerts: Tables<"alerts">[];
  filteredNationalAlerts: Tables<"alerts">[];
  filteredInternationalAlerts: Tables<"alerts">[];
  
  // Actions
  setRegionalSearch: (search: string) => void;
  setNationalSearch: (search: string) => void;
  setInternationalSearch: (search: string) => void;
  refreshAlerts: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

export const useAlerts = (): UseAlertsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Data states
  const [allAlerts, setAllAlerts] = useState<Tables<"alerts">[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  // Search states
  const [regionalSearch, setRegionalSearch] = useState("");
  const [nationalSearch, setNationalSearch] = useState("");
  const [internationalSearch, setInternationalSearch] = useState("");

  // Fetch user location
  const fetchUserLocation = useCallback(async () => {
    if (!user) {
      setLoadingLocation(false);
      return;
    }

    setLoadingLocation(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('country, state, district')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUserLocation({
          country: data.country,
          state: data.state,
          district: data.district,
        });
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      toast({
        title: "Error",
        description: "Failed to load your location data",
        variant: "destructive",
      });
    } finally {
      setLoadingLocation(false);
    }
  }, [user, toast]);

  // Fetch all alerts
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setAllAlerts(sortAlertsByDate(data));
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh functions
  const refreshAlerts = useCallback(async () => {
    await fetchAlerts();
  }, [fetchAlerts]);

  const refreshLocation = useCallback(async () => {
    await fetchUserLocation();
  }, [fetchUserLocation]);

  // Categorize alerts
  const categorizedAlerts = categorizeAlerts(allAlerts, userLocation);

  // Filter alerts by search terms
  const filteredRegionalAlerts = filterAlertsBySearch(categorizedAlerts.regional, regionalSearch);
  const filteredNationalAlerts = filterAlertsBySearch(categorizedAlerts.national, nationalSearch);
  const filteredInternationalAlerts = filterAlertsBySearch(categorizedAlerts.international, internationalSearch);

  // Effects
  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    // Data
    allAlerts,
    categorizedAlerts,
    userLocation,
    
    // Loading states
    loading,
    loadingLocation,
    
    // Search states
    regionalSearch,
    nationalSearch,
    internationalSearch,
    
    // Filtered results
    filteredRegionalAlerts,
    filteredNationalAlerts,
    filteredInternationalAlerts,
    
    // Actions
    setRegionalSearch,
    setNationalSearch,
    setInternationalSearch,
    refreshAlerts,
    refreshLocation,
  };
}; 