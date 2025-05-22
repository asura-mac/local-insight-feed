
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface EmergencyAlert {
  id: string;
  title: string;
  url: string;
  matched_keywords: string[];
  created_at: string;
  source: string;
}

export function useEmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch alerts from Supabase with 6-hour filter
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate timestamp for 6 hours ago
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
      const cutoffTime = sixHoursAgo.toISOString();
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .gte('created_at', cutoffTime)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      if (data) {
        setAlerts(data as EmergencyAlert[]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Error fetching emergency alerts:", err);
      setError(err.message || "Failed to fetch alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);
  
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
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'emergency_alerts'
        },
        (payload) => {
          // Remove deleted alert from the list
          setAlerts(currentAlerts => 
            currentAlerts.filter(alert => alert.id !== payload.old.id)
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);
  
  return {
    alerts,
    loading,
    error,
    refreshAlerts: fetchAlerts
  };
}
