
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        // Get session from URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          // Check if user exists in our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (userError) {
            throw userError;
          }
          
          // Check if this is a completely new user or missing required onboarding info
          const needsOnboarding = !userData || (!userData.location || !userData.phone_number || !userData.occupation);
          
          if (needsOnboarding) {
            // Redirect to onboarding for new users or those with incomplete profiles
            navigate('/onboarding');
          } else {
            // Otherwise, redirect to alerts
            navigate('/alerts');
          }
        } else {
          // No session, redirect to login
          navigate('/login');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message || 'Authentication failed');
        // On error, go to login
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h2 className="text-xl text-red-500">Authentication Error</h2>
          <p className="mt-2">{error}</p>
          <p className="mt-4">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Completing authentication...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
