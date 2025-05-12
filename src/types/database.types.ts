
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      alerts: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          country: string | null
          state: string | null
          district: string | null
          source: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          country?: string | null
          state?: string | null
          district?: string | null
          source?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          country?: string | null
          state?: string | null
          district?: string | null
          source?: string | null
          timestamp?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          location: string | null
          country: string | null
          state: string | null
          district: string | null
          phone_number: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          location?: string | null
          country?: string | null
          state?: string | null
          district?: string | null
          phone_number?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          location?: string | null
          country?: string | null
          state?: string | null
          district?: string | null
          phone_number?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
