import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/database.types";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmergencyAlertsSection from "@/components/EmergencyAlerts";
import React from "react";

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // Log error to service if needed
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <AlertTriangle className="h-12 w-12 text-dark-accent mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-dark-text-primary">Something went wrong</h2>
          <p className="text-dark-text-secondary mb-4">An unexpected error occurred. Please try refreshing the page or come back later.</p>
          <Button onClick={() => window.location.reload()} className="bg-dark-accent hover:bg-dark-accent-hover text-white">
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-dark-text-primary">My Alerts</h1>
          </div>
          
          <Tabs defaultValue="ani" className="w-full mb-6">
            <TabsList className="bg-dark-surface border-dark-border">
              <TabsTrigger value="official" className="text-dark-text-secondary data-[state=active]:bg-dark-accent data-[state=active]:text-white">
                Official Alerts
              </TabsTrigger>
              <TabsTrigger value="ani" className="text-dark-text-secondary data-[state=active]:bg-dark-accent data-[state=active]:text-white">
                ANI News Alerts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="official">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-dark-border bg-dark-surface">
                      <CardHeader>
                        <div className="w-2/3 h-6 bg-dark-surface-light animate-pulse rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="w-full h-4 bg-dark-surface-light animate-pulse rounded"></div>
                          <div className="w-4/5 h-4 bg-dark-surface-light animate-pulse rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <Card className="border-dark-border bg-dark-surface">
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
                        className="text-dark-text-muted"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-dark-text-primary">No alerts found</h3>
                    <p className="text-dark-text-secondary mt-2">
                      There are no active alerts for your location at this time.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="overflow-hidden border-dark-border bg-dark-surface hover:bg-dark-surface-light transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-dark-text-primary">{alert.headline}</CardTitle>
                          <div className="text-sm bg-dark-accent/10 text-dark-accent font-medium px-3 py-1 rounded-full">
                            {alert.district || alert.state || alert.country}
                          </div>
                        </div>
                        <CardDescription className="flex items-center space-x-2 text-dark-text-secondary">
                          <span>{alert.source}</span>
                          <span>•</span>
                          <span>{formatDate(alert.timestamp)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-dark-text-secondary">{alert.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ani">
              <EmergencyAlertsSection />
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
