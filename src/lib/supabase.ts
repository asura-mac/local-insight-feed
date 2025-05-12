
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// These should be set in a .env file in a real application
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

export type User = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
