
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Use the values from the Supabase integration
const SUPABASE_URL = "https://pjqxfwvvrwhbwccarsob.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcXhmd3Z2cndoYndjY2Fyc29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzM2OTEsImV4cCI6MjA2MjY0OTY5MX0.c2rsYwUCRZh6Obt_vZD0NdP-ic5HCheZ-pAKUBEa-5Q";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export type User = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
