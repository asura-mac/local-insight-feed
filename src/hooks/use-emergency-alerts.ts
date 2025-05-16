
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface EmergencyAlert {
  id: string;
  title: string;
  url: string;
  matched_keywords: string[];
  created_at: string;
}

export function useEmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch alerts from Supabase
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      if (data) {
        setAlerts(data as EmergencyAlert[]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching emergency alerts:", err);
      setError("Failed to fetch alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Subscribe to real-time updates
  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('emergency_alerts_changes')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'emergency_alerts' 
        },
        (payload) => {
          // Add new alert to the top of the list
          setAlerts(currentAlerts => [payload.new as EmergencyAlert, ...currentAlerts]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return {
    alerts,
    loading,
    error,
    refreshAlerts: fetchAlerts
  };
}
