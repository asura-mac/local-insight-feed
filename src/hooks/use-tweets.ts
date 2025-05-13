
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  timestamp: number;
  link: string;
  isAlert: boolean;
}

export function useTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seenTweetsRef = useRef<Set<string>>(new Set());
  
  // Check if notifications are supported and permitted
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }
    
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setNotificationsEnabled(granted);
      return granted;
    }
    
    return false;
  };
  
  // Function to show notification for new tweet
  const showNotification = (tweet: Tweet) => {
    if (!notificationsEnabled || !("Notification" in window)) return;
    
    try {
      new Notification("New Alert from ANI", {
        body: tweet.text,
        icon: "/notification-icon.png", // You can add an icon file later
      });
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };
  
  // Function to fetch tweets
  const fetchTweets = async () => {
    try {
      const { data: tweets, error } = await supabase.functions.invoke("fetch-ani-tweets");
      
      if (error) throw error;
      
      if (tweets && Array.isArray(tweets)) {
        // Sort by timestamp, newest first
        const sortedTweets = [...tweets].sort((a, b) => b.timestamp - a.timestamp);
        
        // Check for new tweets and show notifications
        sortedTweets.forEach(tweet => {
          if (!seenTweetsRef.current.has(tweet.id)) {
            seenTweetsRef.current.add(tweet.id);
            // Only show notification for tweets we haven't seen before
            // and if it's not the first load (to avoid notification flood)
            if (loading === false && notificationsEnabled) {
              showNotification(tweet);
            }
          }
        });
        
        setTweets(sortedTweets);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching tweets:", err);
      setError("Failed to fetch tweets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize seenTweets from localStorage
  useEffect(() => {
    const storedTweets = localStorage.getItem("seenTweets");
    if (storedTweets) {
      try {
        const parsedTweets = JSON.parse(storedTweets);
        seenTweetsRef.current = new Set(parsedTweets);
      } catch (error) {
        console.error("Error parsing stored tweets:", error);
        localStorage.removeItem("seenTweets");
      }
    }
    
    // Check notification permission on mount
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);
  
  // Save seenTweets to localStorage when it changes
  useEffect(() => {
    const tweetsArray = Array.from(seenTweetsRef.current);
    localStorage.setItem("seenTweets", JSON.stringify(tweetsArray));
  }, [tweets]);
  
  // Poll for tweets every 30 seconds
  useEffect(() => {
    fetchTweets();
    
    const interval = setInterval(fetchTweets, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [notificationsEnabled]);
  
  return {
    tweets,
    loading,
    error,
    notificationsEnabled,
    requestNotificationPermission
  };
}
