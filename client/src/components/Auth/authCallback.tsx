import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any;

    const handleAuthChange = async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // Verify session with Supabase
          const { error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;

          // Store tokens with error handling
          try {
            sessionStorage.setItem('supabase_token', session.access_token);
            if (session.provider_token) {
              sessionStorage.setItem('google_access_token', session.provider_token);
            }
          } catch (storageError) {
            console.error('Error storing session:', storageError);
            throw new Error('Failed to store session data');
          }

          // Clean URL only after successful validation
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navigate to invoices instead of dashboard
          navigate('/invoices', { replace: true });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          // Clear all storage on sign out
          sessionStorage.clear();
          localStorage.clear();
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        navigate('/login', { state: { error: 'Authentication failed' }, replace: true });
      }
    };

    // Subscribe to auth state changes
    authSubscription = supabase.auth.onAuthStateChange(handleAuthChange).data.subscription;

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          await handleAuthChange('SIGNED_IN', session);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setError('Failed to check session');
        navigate('/login', { replace: true });
      }
    };

    checkSession();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <div className="animate-pulse">Finishing authentication...</div>
        )}
      </div>
    </div>
  );
}