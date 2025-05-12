
import { createContext, useContext, useEffect, useState } from 'react';
import { User, supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from './authUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        
        // Defer data fetching to prevent potential deadlocks
        setTimeout(async () => {
          // Check if user exists in our users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // If user doesn't exist in our database or has no location, redirect to onboarding
          if (!userData || !userData.location) {
            navigate('/onboarding');
          } else {
            navigate('/alerts');
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    });

    // Then check for active session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error);
        return;
      }
      
      if (data?.session) {
        setUser(data.session.user);
      }
      
      setLoading(false);
    };
    
    getSession();

    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Try global sign out
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      
      // Force page reload for a clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
