
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useDeviceInfo } from './use-device-info';
import { supabase } from "@/lib/supabase";

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default");
  const [subscription, setSubscription] = useState<boolean>(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { deviceInfo, isIOS, isPWA, supportsNotifications } = useDeviceInfo();

  // Check notification permission on component mount
  useEffect(() => {
    const checkPermission = () => {
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
      }
      
      // Check if user previously subscribed (stored in localStorage)
      const isSubscribed = localStorage.getItem("emergencyAlertsSubscribed") === "true";
      setSubscription(isSubscribed);
      setInitialCheckDone(true);
    };
    
    checkPermission();
    
    // Check again when visibility changes (helps after permission dialog)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPermission();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    setIsLoading(true);
    
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser does not support desktop notifications.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
    
    try {
      // Special handling for iOS
      if (isIOS && !isPWA) {
        toast({
          title: "iOS Notification Setup Required",
          description: "Please add this app to your home screen first for notifications to work.",
          variant: "default",
        });
        setIsLoading(false);
        return false;
      }
      
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
        
        setIsLoading(false);
        return true;
      } else if (permission === "denied") {
        toast({
          title: "Notification Permission Denied",
          description: "Please enable notifications in your browser settings to receive alerts.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Permission Error",
        description: `There was an error requesting notification permission: ${error.message}`,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
    return false;
  };
  
  // Toggle subscription state
  const toggleSubscription = async () => {
    if (subscription) {
      // Unsubscribe
      setSubscription(false);
      localStorage.removeItem("emergencyAlertsSubscribed");
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive emergency alert notifications.",
      });
      return true;
    } else if (notificationPermission === "granted") {
      // Subscribe if permission is already granted
      setSubscription(true);
      localStorage.setItem("emergencyAlertsSubscribed", "true");
      toast({
        title: "Notifications Enabled",
        description: "You will now receive emergency alert notifications.",
      });
      return true;
    } else {
      // Request permission if not already granted
      return await requestNotificationPermission();
    }
  };
  
  // Show a notification
  const showNotification = (title: string, options: NotificationOptions) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return false;
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
      
      return true;
    } catch (error) {
      console.error("Error showing notification:", error);
      return false;
    }
  };
  
  // Test connection to Supabase
  const testConnection = async () => {
    setIsLoading(true);
    
    try {
      // Test Supabase connection by fetching a single row
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('id')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      // Show success toast
      toast({
        title: "Connection Successful",
        description: "Your app is properly connected to receive emergency alerts.",
      });
      
      // If notifications are enabled, show a test notification
      if (subscription && notificationPermission === "granted") {
        showNotification("Test Connection Successful", {
          body: "Your app is properly connected to receive emergency alerts.",
          icon: '/favicon.ico',
        });
      }
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Connection test failed:", error);
      toast({
        title: "Connection Failed",
        description: `Could not connect to alert system: ${error.message}`,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };
  
  return {
    notificationPermission,
    subscription,
    isLoading,
    initialCheckDone,
    requestNotificationPermission,
    toggleSubscription,
    showNotification,
    testConnection,
    canUseNativeNotifications: supportsNotifications && (!isIOS || isPWA)
  };
}
