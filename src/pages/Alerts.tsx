
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/database.types";
import { format } from "date-fns";

export default function Alerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    country: string | null;
    state: string | null;
    district: string | null;
  } | null>(null);
  const [alerts, setAlerts] = useState<Tables<"alerts">[]>([]);
  
  // Fetch user's location data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
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
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  // Fetch alerts based on user's location
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!userLocation) return;
      
      setLoading(true);
      
      try {
        let query = supabase
          .from('alerts')
          .select('*')
          .order('timestamp', { ascending: false });
        
        // Filter by location - if any matches country, state OR district
        const filters = [];
        
        if (userLocation.country) {
          filters.push(`country.eq.${userLocation.country}`);
        }
        
        if (userLocation.state) {
          filters.push(`state.eq.${userLocation.state}`);
        }
        
        if (userLocation.district) {
          filters.push(`district.eq.${userLocation.district}`);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          setAlerts(data);
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
    };
    
    fetchAlerts();
  }, [userLocation, toast]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Alerts</h1>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-2/3 h-6 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="w-4/5 h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex justify-center">
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
                className="text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No alerts found</h3>
            <p className="text-gray-500 mt-2">
              There are no active alerts for your location at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle>{alert.title}</CardTitle>
                  <div className="text-sm bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
                    {alert.district || alert.state || alert.country}
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <span>{alert.source}</span>
                  <span>•</span>
                  <span>{formatDate(alert.timestamp)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{alert.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
