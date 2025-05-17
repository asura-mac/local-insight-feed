
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergencyAlerts } from "@/hooks/use-emergency-alerts";
import { EmergencyAlertCard } from "@/components/EmergencyAlerts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BellRing, BellOff, Info } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { alerts, loading, error, refreshAlerts } = useEmergencyAlerts();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default");
  const [subscription, setSubscription] = useState<boolean>(false);

  // Check notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Check if user previously subscribed (stored in localStorage)
    const isSubscribed = localStorage.getItem("emergencyAlertsSubscribed") === "true";
    setSubscription(isSubscribed);
  }, []);

  // Subscribe to real-time updates for new alerts
  useEffect(() => {
    if (subscription && notificationPermission === "granted") {
      // Set up real-time subscription for new alerts
      const channel = supabase
        .channel('emergency_alerts_notifications')
        .on(
          'postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'emergency_alerts' 
          },
          (payload) => {
            const newAlert = payload.new as any;
            // Show browser notification for new alert
            showNotification(newAlert.title, {
              body: `Keywords: ${newAlert.matched_keywords.join(', ')}`,
              icon: '/favicon.ico',
              tag: newAlert.id,
              data: { url: newAlert.url }
            });
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [subscription, notificationPermission]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser does not support desktop notifications.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        setSubscription(true);
        localStorage.setItem("emergencyAlertsSubscribed", "true");
        
        toast({
          title: "Notifications Enabled",
          description: "You will now receive emergency alert notifications.",
        });
        
        // Show a test notification
        showNotification("Notifications Enabled", {
          body: "You will now receive emergency alerts when they are detected.",
          icon: '/favicon.ico',
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Permission Error",
        description: "There was an error requesting notification permission.",
        variant: "destructive",
      });
    }
  };
  
  const toggleSubscription = () => {
    if (subscription) {
      // Unsubscribe
      setSubscription(false);
      localStorage.removeItem("emergencyAlertsSubscribed");
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive emergency alert notifications.",
      });
    } else if (notificationPermission === "granted") {
      // Subscribe if permission is already granted
      setSubscription(true);
      localStorage.setItem("emergencyAlertsSubscribed", "true");
      toast({
        title: "Notifications Enabled",
        description: "You will now receive emergency alert notifications.",
      });
    } else {
      // Request permission if not already granted
      requestNotificationPermission();
    }
  };
  
  const showNotification = (title: string, options: NotificationOptions) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    
    try {
      const notification = new Notification(title, options);
      
      // Handle notification click (open the news article)
      notification.onclick = () => {
        if (options.data && options.data.url) {
          window.open(options.data.url, '_blank');
        }
        notification.close();
      };
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };
  
  // Get latest alert time for display
  const getLatestAlertTime = () => {
    if (alerts.length === 0) return "No alerts yet";
    
    const latestAlert = alerts[0];
    const alertTime = new Date(latestAlert.created_at);
    return alertTime.toLocaleString();
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emergency Alert Notifications</h1>
        <p className="text-muted-foreground">
          Stay informed about emergencies with real-time notifications
        </p>
      </div>
      
      {/* Notification Permission Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {subscription ? 
              <BellRing className="h-5 w-5 text-green-500" /> : 
              <BellOff className="h-5 w-5 text-gray-500" />
            }
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Receive instant notifications when new emergency alerts are detected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>
                We constantly monitor news sources for emergency keywords. When an alert is detected, 
                you'll receive an instant notification even when this tab is not open.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="mb-4">
            <p className="text-sm mb-2">
              <strong>Status:</strong> {subscription ? 
                <span className="text-green-600">Subscribed to alerts</span> : 
                <span className="text-gray-500">Not subscribed</span>
              }
            </p>
            <p className="text-sm mb-2">
              <strong>Notification permission:</strong> {notificationPermission}
            </p>
            <p className="text-sm mb-4">
              <strong>Latest alert:</strong> {getLatestAlertTime()}
            </p>
            
            <Button 
              onClick={toggleSubscription}
              className="w-full sm:w-auto"
              variant={subscription ? "outline" : "default"}
            >
              {subscription ? 
                <><BellOff className="mr-2 h-4 w-4" /> Disable Notifications</> : 
                <><BellRing className="mr-2 h-4 w-4" /> Enable Notifications</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent alerts table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Emergency Alerts</CardTitle>
          <CardDescription>
            Showing the most recent emergency alerts detected from news sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading alerts...</div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error loading alerts</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" onClick={refreshAlerts} className="mt-2">
                Try Again
              </Button>
            </Alert>
          ) : alerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No emergency alerts detected yet.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.slice(0, 10).map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        <a 
                          href={alert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          {alert.title}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {alert.matched_keywords.slice(0, 3).map((keyword, idx) => (
                            <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {keyword}
                            </span>
                          ))}
                          {alert.matched_keywords.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              +{alert.matched_keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detailed view of recent alerts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Detailed Alerts</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading alerts...</div>
          ) : alerts.length > 0 ? (
            alerts.slice(0, 5).map((alert) => (
              <EmergencyAlertCard key={alert.id} alert={alert} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No emergency alerts to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
