
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/database.types";
import { format } from "date-fns";
import { useTweets, Tweet } from "@/hooks/use-tweets";
import { AlertTriangle, Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const {
    tweets,
    loading: tweetsLoading,
    error: tweetsError,
    notificationsEnabled,
    requestNotificationPermission
  } = useTweets();
  
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
        <h1 className="text-2xl font-bold text-white">My Alerts</h1>
        <Button
          onClick={requestNotificationPermission}
          variant="outline"
          size="sm"
          className={`${
            notificationsEnabled ? "bg-[#333] text-white" : "bg-[#D32F2F] text-white"
          }`}
        >
          {notificationsEnabled ? (
            <>
              <BellRing className="w-4 h-4 mr-2" />
              Notifications On
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="official" className="w-full mb-6">
        <TabsList className="bg-[#333] border-gray-700">
          <TabsTrigger value="official" className="text-white data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
            Official Alerts
          </TabsTrigger>
          <TabsTrigger value="ani" className="text-white data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
            ANI Twitter Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="official">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-gray-800 bg-[#222]">
                  <CardHeader>
                    <div className="w-2/3 h-6 bg-gray-700 animate-pulse rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-gray-700 animate-pulse rounded"></div>
                      <div className="w-4/5 h-4 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card className="border-gray-800 bg-[#222]">
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
                <h3 className="text-lg font-medium text-white">No alerts found</h3>
                <p className="text-gray-400 mt-2">
                  There are no active alerts for your location at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="overflow-hidden border-gray-800 bg-[#222]">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{alert.title}</CardTitle>
                      <div className="text-sm bg-[#D32F2F]/10 text-[#D32F2F] font-medium px-3 py-1 rounded-full">
                        {alert.district || alert.state || alert.country}
                      </div>
                    </div>
                    <CardDescription className="flex items-center space-x-2 text-gray-400">
                      <span>{alert.source}</span>
                      <span>•</span>
                      <span>{formatDate(alert.timestamp)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{alert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ani">
          {tweetsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-[#D32F2F] animate-spin" />
            </div>
          ) : tweetsError ? (
            <Card className="border-gray-800 bg-[#222]">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <AlertTriangle className="h-12 w-12 text-[#F9A825]" />
                </div>
                <h3 className="text-lg font-medium text-white">Failed to load tweets</h3>
                <p className="text-gray-400 mt-2">
                  {tweetsError}
                </p>
                <Button 
                  className="mt-4 bg-[#D32F2F] hover:bg-[#C62828] text-white" 
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : tweets.length === 0 ? (
            <Card className="border-gray-800 bg-[#222]">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <Bell className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white">No recent tweets</h3>
                <p className="text-gray-400 mt-2">
                  There are no tweets from ANI in the last hour.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <Card 
                  key={tweet.id} 
                  className={`overflow-hidden border-gray-800 ${
                    tweet.isAlert ? "bg-[#F9A825]/10 border-[#F9A825]/30" : "bg-[#222]"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white flex items-center">
                        {tweet.isAlert && (
                          <AlertTriangle className="h-4 w-4 text-[#F9A825] mr-2" />
                        )}
                        ANI Update
                      </CardTitle>
                      <div className="text-sm bg-[#D32F2F]/10 text-[#D32F2F] font-medium px-3 py-1 rounded-full">
                        {tweet.isAlert ? "ALERT" : "Update"}
                      </div>
                    </div>
                    <CardDescription className="flex items-center space-x-2 text-gray-400">
                      <span>@ANI</span>
                      <span>•</span>
                      <span>{formatDate(tweet.created_at)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{tweet.text}</p>
                    <a 
                      href={tweet.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#D32F2F] hover:underline mt-2 inline-block"
                    >
                      View on Twitter →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
