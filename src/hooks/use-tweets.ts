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

// Stub implementation for backward compatibility
export function useTweets() {
  return {
    tweets: [],
    loading: false,
    error: null,
    notificationsEnabled: false,
    requestNotificationPermission: async () => false
  };
}
