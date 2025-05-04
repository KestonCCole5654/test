import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

          // Check if we have the required Google scopes
          if (!session.provider_token) {
            throw new Error('Google authentication failed. Please try again.');
          }

          // Clean URL only after successful validation
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          // Clear all storage on sign out
          sessionStorage.clear();
          localStorage.clear();
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to auth changes
    authSubscription = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      authSubscription?.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}