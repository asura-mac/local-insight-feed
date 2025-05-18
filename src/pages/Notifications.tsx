
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergencyAlerts } from "@/hooks/use-emergency-alerts";
import { EmergencyAlertCard } from "@/components/EmergencyAlerts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, BellOff, Info, Smartphone, Monitor, Share2, Download } from "lucide-react";

// Define interface for a detected device type
interface DeviceInfo {
  type: 'desktop' | 'mobile';
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other';
  browser: string;
  supportsNotifications: boolean;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { alerts, loading, error, refreshAlerts } = useEmergencyAlerts();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default");
  const [subscription, setSubscription] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("notifications");

  // Detect device information
  useEffect(() => {
    const ua = navigator.userAgent;
    let deviceType: 'desktop' | 'mobile' = 'desktop';
    let os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other' = 'other';
    let browser = 'unknown';
    
    // Detect if mobile
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      deviceType = 'mobile';
      
      // Detect OS
      if (/iPhone|iPad|iPod/i.test(ua)) {
        os = 'ios';
      } else if (/Android/i.test(ua)) {
        os = 'android';
      }
    } else {
      // Desktop OS detection
      if (/Windows/i.test(ua)) os = 'windows';
      else if (/Macintosh/i.test(ua)) os = 'macos';
      else if (/Linux/i.test(ua)) os = 'linux';
    }
    
    // Browser detection
    if (/Chrome/i.test(ua) && !/Chromium|Edge|Edg|OPR|SamsungBrowser/i.test(ua)) {
      browser = 'Chrome';
    } else if (/Firefox/i.test(ua)) {
      browser = 'Firefox';
    } else if (/Safari/i.test(ua) && !/Chrome|Chromium|Edge|Edg|OPR/i.test(ua)) {
      browser = 'Safari';
    } else if (/Edge|Edg/i.test(ua)) {
      browser = 'Edge';
    } else if (/Opera|OPR/i.test(ua)) {
      browser = 'Opera';
    }
    
    // Check if browser supports notifications
    const supportsNotifications = "Notification" in window;
    
    setDeviceInfo({
      type: deviceType,
      os,
      browser,
      supportsNotifications
    });
    
  }, []);

  // Update current time every minute to refresh relative time displays
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
    } catch (error: any) {
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
  
  // Format time elapsed since alert was posted
  const getTimeElapsed = (timestamp: string) => {
    const alertTime = new Date(timestamp);
    const currentTime = new Date();
    const diffMs = currentTime.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get latest alert time for display
  const getLatestAlertTime = useCallback(() => {
    if (alerts.length === 0) return "No alerts yet";
    
    const latestAlert = alerts[0];
    return getTimeElapsed(latestAlert.created_at);
  }, [alerts]);

  // Share page functionality for mobile users
  const sharePage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Alerts',
          text: 'Get real-time emergency alerts notifications',
          url: window.location.href,
        });
        toast({
          title: "Shared Successfully",
          description: "You've shared the emergency alerts page.",
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast({
            title: "Share Error",
            description: "There was an error sharing the page.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "The page URL has been copied to your clipboard.",
      });
    }
  };

  // Function to check if the application is installed as PWA
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };

  // Function to provide instructions based on device
  const getNotificationInstructions = () => {
    if (!deviceInfo) return null;
    
    if (deviceInfo.type === 'mobile') {
      if (deviceInfo.os === 'ios') {
        return (
          <Alert className="mt-4 bg-blue-50">
            <AlertTitle className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4" /> iOS Device Detected
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p className="text-sm">
                For the best notification experience on iOS:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Tap the share button in your browser</li>
                <li>Select "Add to Home Screen"</li>
                <li>Open the app from your home screen</li>
                <li>Enable notifications when prompted</li>
              </ol>
              <Button 
                onClick={sharePage} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                <Share2 className="mr-1 h-4 w-4" /> Share This Page
              </Button>
            </AlertDescription>
          </Alert>
        );
      } else if (deviceInfo.os === 'android') {
        return (
          <Alert className="mt-4 bg-green-50">
            <AlertTitle className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4" /> Android Device Detected
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p className="text-sm">
                For reliable notifications on Android:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Install this page as an app when prompted</li>
                <li>Or add to home screen from browser menu</li>
                <li>Keep the app running in the background</li>
                <li>Disable battery optimization for the app in system settings</li>
              </ol>
              {!isPWA() && (
                <Button 
                  onClick={() => {
                    toast({
                      title: "Installation",
                      description: "Look for 'Add to Home Screen' in your browser menu to install.",
                    });
                  }} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  <Download className="mr-1 h-4 w-4" /> Install App
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      }
    }
    
    return null;
  };

  return (
    <AppLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Emergency Alert System</h1>
          <p className="text-muted-foreground text-gray-300">
            Stay informed about emergencies with real-time notifications
          </p>
          
          <TabsList className="mt-4 bg-[#333] border-gray-700">
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-white data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
              Live Alerts
            </TabsTrigger>
            <TabsTrigger value="setup" className="text-white data-[state=active]:bg-[#D32F2F] data-[state=active]:text-white">
              Setup Guide
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="notifications" className="space-y-4">
          {/* Notification Permission Card */}
          <Card className="border-gray-800 bg-[#222]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                {subscription ? 
                  <BellRing className="h-5 w-5 text-green-500" /> : 
                  <BellOff className="h-5 w-5 text-gray-500" />
                }
                Emergency Notifications
              </CardTitle>
              <CardDescription className="text-gray-300">
                Receive instant alerts when emergencies are detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Alert className="bg-[#333] border-gray-700 text-gray-200">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertTitle className="text-gray-100">How it works</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    We continuously monitor news sources for emergency keywords. When an alert is detected, 
                    you'll receive an instant notification even when this tab is not active.
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="mb-4">
                <p className="text-sm mb-2 text-gray-300">
                  <strong className="text-white">Status:</strong> {subscription ? 
                    <span className="text-green-400">Subscribed to alerts</span> : 
                    <span className="text-gray-500">Not subscribed</span>
                  }
                </p>
                <p className="text-sm mb-2 text-gray-300">
                  <strong className="text-white">Notification permission:</strong> <span className="text-gray-300">{notificationPermission}</span>
                </p>
                <p className="text-sm mb-4 text-gray-300">
                  <strong className="text-white">Latest alert:</strong> <span className="text-gray-300">{getLatestAlertTime()}</span>
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
              
              {deviceInfo?.type === 'mobile' && getNotificationInstructions()}
              
              {deviceInfo && (
                <div className="mt-6 p-3 rounded bg-[#2A2A2A] text-xs text-gray-400">
                  <p>Device: {deviceInfo.type} ({deviceInfo.os})</p>
                  <p>Browser: {deviceInfo.browser}</p>
                  <p>Notifications supported: {deviceInfo.supportsNotifications ? 'Yes' : 'No'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          {/* Recent alerts table */}
          <Card className="border-gray-800 bg-[#222]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Live Emergency Alerts</CardTitle>
                  <CardDescription className="text-gray-300">
                    Showing the most recent emergency alerts detected
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-[#D32F2F]/10 text-[#FF5252] border-[#D32F2F]/20">
                  LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-gray-400">Loading alerts...</div>
              ) : error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error loading alerts</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  <Button variant="outline" onClick={refreshAlerts} className="mt-2">
                    Try Again
                  </Button>
                </Alert>
              ) : alerts.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No emergency alerts detected yet.
                </div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Alert</TableHead>
                        <TableHead className="text-gray-300">Keywords</TableHead>
                        <TableHead className="text-gray-300">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id} className="border-gray-700">
                          <TableCell className="font-medium">
                            <a 
                              href={alert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-blue-400"
                            >
                              {alert.title}
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {alert.matched_keywords.slice(0, 3).map((keyword, idx) => (
                                <span key={idx} className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded">
                                  {keyword}
                                </span>
                              ))}
                              {alert.matched_keywords.length > 3 && (
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                                  +{alert.matched_keywords.length - 3} more
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {getTimeElapsed(alert.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-4 text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshAlerts}
                  className="text-gray-300 border-gray-700"
                >
                  Refresh Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Detailed view of recent alerts */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Detailed Alerts</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-400">Loading alerts...</div>
              ) : alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert) => (
                  <EmergencyAlertCard key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No emergency alerts to display.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="setup" className="space-y-4">
          <Card className="border-gray-800 bg-[#222]">
            <CardHeader>
              <CardTitle className="text-white">Setup Guide</CardTitle>
              <CardDescription className="text-gray-300">
                Follow these steps to ensure you receive emergency alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white flex items-center mb-2">
                  <Monitor className="mr-2 h-5 w-5 text-blue-400" /> 
                  Desktop Setup
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click "Enable Notifications" button in the Notifications tab</li>
                  <li>Allow notifications when your browser prompts you</li>
                  <li>Keep this website bookmarked for easy access</li>
                  <li>You'll receive notifications even when this tab is not active</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white flex items-center mb-2">
                  <Smartphone className="mr-2 h-5 w-5 text-green-400" /> 
                  Mobile Setup
                </h3>
                <p className="mb-2">Mobile notifications work best when installed as an app:</p>
                
                <Tabs defaultValue="android" className="mt-4 border-gray-700">
                  <TabsList className="bg-[#333] border-gray-700">
                    <TabsTrigger value="android" className="text-white data-[state=active]:bg-green-800 data-[state=active]:text-white">
                      Android
                    </TabsTrigger>
                    <TabsTrigger value="ios" className="text-white data-[state=active]:bg-blue-800 data-[state=active]:text-white">
                      iOS
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="android" className="pt-4">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Open this page in Chrome</li>
                      <li>Tap the three-dot menu in the top-right</li>
                      <li>Select "Add to Home screen"</li>
                      <li>Open the app from your home screen</li>
                      <li>Enable notifications when prompted</li>
                      <li>For best results, disable battery optimization for this app</li>
                    </ol>
                  </TabsContent>
                  <TabsContent value="ios" className="pt-4">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Open this page in Safari</li>
                      <li>Tap the Share icon at the bottom of the screen</li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" in the top-right corner</li>
                      <li>Open the app from your home screen</li>
                      <li>Enable notifications when prompted</li>
                      <li>Note: iOS may limit background notifications</li>
                    </ol>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white flex items-center mb-2">
                  <Info className="mr-2 h-5 w-5 text-purple-400" /> 
                  Troubleshooting
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>If notifications aren't working, check your browser's site settings</li>
                  <li>Make sure notifications are enabled for this website</li>
                  <li>Try refreshing the page or reinstalling as an app</li>
                  <li>Some mobile browsers have limited notification support</li>
                  <li>For mobile devices, installing as an app provides the most reliable experience</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button onClick={refreshAlerts} variant="default" className="mr-2">
                  Test Connection
                </Button>
                {deviceInfo?.type === 'mobile' && (
                  <Button onClick={sharePage} variant="outline" className="ml-2">
                    <Share2 className="mr-2 h-4 w-4" /> Share This App
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default NotificationsPage;
