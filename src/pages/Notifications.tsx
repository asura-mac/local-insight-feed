
import React, { useState, useEffect, useCallback } from "react";
import { useEmergencyAlerts } from "@/hooks/use-emergency-alerts";
import { EmergencyAlertCard } from "@/components/EmergencyAlerts";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { BellRing, BellOff, Info, Smartphone, Monitor, Share2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useDeviceInfo } from "@/hooks/use-device-info";
import { useNotifications } from "@/hooks/use-notifications";

const NotificationsPage = () => {
  const { alerts, loading, error, refreshAlerts } = useEmergencyAlerts();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("notifications");
  const { toast } = useToast();
  const { 
    deviceInfo, 
    isIOS, 
    isAndroid,
    isMobile,
    isPWA,
    supportsNotifications 
  } = useDeviceInfo();
  
  const {
    notificationPermission,
    subscription,
    isLoading,
    requestNotificationPermission,
    toggleSubscription,
    testConnection
  } = useNotifications();

  // Update current time every minute to refresh relative time displays
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Function to provide instructions based on device
  const getNotificationInstructions = () => {
    if (!deviceInfo) return null;
    
    if (isIOS) {
      return (
        <Alert className="mt-4 bg-blue-50">
          <AlertTitle className="flex items-center">
            <Smartphone className="mr-2 h-4 w-4" /> iOS Device Detected
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p className="text-sm">
              <strong>Important:</strong> iOS requires installing this app to your home screen for notifications to work properly.
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Tap the share button <span className="inline-block px-2 py-1 bg-gray-200 rounded">􀈂</span> at the bottom of your screen</li>
              <li>Scroll down and select "Add to Home Screen" <span className="inline-block px-2 py-1 bg-gray-200 rounded">+</span></li>
              <li>Tap "Add" in the top right corner</li>
              <li>Open the app from your home screen</li>
              <li>Enable notifications when prompted</li>
            </ol>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                onClick={sharePage} 
                variant="outline" 
                size="sm"
              >
                <Share2 className="mr-1 h-4 w-4" /> Share This Page
              </Button>
              {isPWA ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="mr-1 h-3 w-3" /> Installed as App
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  <AlertCircle className="mr-1 h-3 w-3" /> Not Installed Yet
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    } else if (isAndroid) {
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
              <li>Click "Enable Notifications" to grant permissions</li>
              <li>For best experience, install as an app when prompted</li>
              <li>If not prompted, tap the menu icon (⋮) in Chrome</li>
              <li>Select "Install app" or "Add to Home screen"</li>
              <li>Keep the app running in the background</li>
            </ol>
            {!isPWA && (
              <Button 
                onClick={() => {
                  toast({
                    title: "Installation",
                    description: "Look for 'Add to Home Screen' or 'Install app' in your browser menu.",
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
    } else if (deviceInfo.type === 'desktop') {
      return (
        <Alert className="mt-4 bg-gray-50">
          <AlertTitle className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" /> Desktop Device Detected
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p className="text-sm">
              For desktop notifications:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Click "Enable Notifications" to grant browser permission</li>
              <li>Keep this tab open to receive alerts in real-time</li>
              <li>Consider bookmarking this page for easy access</li>
            </ol>
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  // Get notification status message
  const getNotificationStatusMessage = () => {
    if (!supportsNotifications) {
      return "Your browser doesn't support notifications";
    }
    
    if (isIOS && !isPWA) {
      return "Install from home screen for notifications";
    }
    
    switch (notificationPermission) {
      case 'granted':
        return subscription ? 'Notifications are enabled' : 'Notifications permission granted but disabled';
      case 'denied':
        return 'Notifications are blocked in browser settings';
      default:
        return 'Notifications not yet enabled';
    }
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
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-white">Notification Status</p>
                    <p className="text-sm text-gray-400">
                      {getNotificationStatusMessage()}
                    </p>
                  </div>
                  <Switch 
                    checked={subscription} 
                    onCheckedChange={toggleSubscription}
                    disabled={isLoading || (!supportsNotifications) || (isIOS && !isPWA)}
                  />
                </div>
                
                <p className="text-sm mb-2 text-gray-300">
                  <strong className="text-white">Notification permission:</strong> <span className="text-gray-300">{notificationPermission}</span>
                </p>
                <p className="text-sm mb-4 text-gray-300">
                  <strong className="text-white">Latest alert:</strong> <span className="text-gray-300">{getLatestAlertTime()}</span>
                </p>
                
                <Button 
                  onClick={toggleSubscription}
                  className="w-full sm:w-auto mb-3"
                  variant={subscription ? "outline" : "default"}
                  disabled={isLoading || (!supportsNotifications) || (isIOS && !isPWA)}
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : subscription ? (
                    <><BellOff className="mr-2 h-4 w-4" /> Disable Notifications</>
                  ) : (
                    <><BellRing className="mr-2 h-4 w-4" /> Enable Notifications</>
                  )}
                </Button>
                
                <Button
                  onClick={testConnection}
                  className="w-full sm:w-auto sm:ml-2"
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading ? "Testing..." : "Test Connection"}
                </Button>
              </div>
              
              {deviceInfo && getNotificationInstructions()}
              
              {deviceInfo && (
                <div className="mt-6 p-3 rounded bg-[#2A2A2A] text-xs text-gray-400">
                  <p>Device: {deviceInfo.type} ({deviceInfo.os})</p>
                  <p>Browser: {deviceInfo.browser}</p>
                  <p>Notifications supported: {supportsNotifications ? 'Yes' : 'No'}</p>
                  {isPWA && <p><CheckCircle className="inline h-3 w-3 text-green-500 mr-1" /> Installed as app</p>}
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
                
                <Tabs defaultValue={isIOS ? "ios" : "android"} className="mt-4 border-gray-700">
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
                      <li>Select "Install app" or "Add to Home screen"</li>
                      <li>Open the app from your home screen</li>
                      <li>Enable notifications when prompted</li>
                      <li>For best results, disable battery optimization for this app</li>
                    </ol>
                    <Button 
                      onClick={testConnection} 
                      variant="default" 
                      className="mr-2 mt-4"
                    >
                      Test Connection
                    </Button>
                  </TabsContent>
                  <TabsContent value="ios" className="pt-4">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Open this page in Safari</li>
                      <li>Tap the Share icon <span className="inline-block px-2 py-1 bg-gray-700 rounded text-white">􀈂</span> at the bottom of the screen</li>
                      <li>Scroll down and tap "Add to Home Screen" <span className="inline-block px-2 py-1 bg-gray-700 rounded text-white">+</span></li>
                      <li>Tap "Add" in the top-right corner</li>
                      <li>Open the app from your home screen</li>
                      <li>Enable notifications when prompted</li>
                      <li><strong>Note:</strong> iOS has limited support for web notifications</li>
                    </ol>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button 
                        onClick={sharePage} 
                        variant="default" 
                        className="mr-2"
                      >
                        <Share2 className="mr-1 h-4 w-4" /> Share This App
                      </Button>
                      <Button 
                        onClick={testConnection} 
                        variant="outline" 
                        className="mr-2"
                      >
                        Test Connection
                      </Button>
                    </div>
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
                  <li>Use the "Test Connection" button to verify your system can receive alerts</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button onClick={testConnection} variant="default" className="mr-2" disabled={isLoading}>
                  {isLoading ? "Testing..." : "Test Connection"}
                </Button>
                {isMobile && (
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
