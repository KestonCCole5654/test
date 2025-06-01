import { createClient } from '@supabase/supabase-js';

// Custom session storage with error handling and refresh token persistence
const customStorage = {
  getItem: (key: string) => {
    try {
      // Try sessionStorage first
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) return sessionValue;
      
      // Fallback to localStorage for refresh token
      if (key.includes('refresh_token')) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      // Store refresh token in localStorage for persistence
      if (key.includes('refresh_token')) {
        localStorage.setItem(key, value);
      }
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
      if (key.includes('refresh_token')) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
};

// Validate environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`
    Missing Supabase configuration!
    Please check your environment variables:
    - REACT_APP_SUPABASE_URL
    - REACT_APP_SUPABASE_ANON_KEY
  `);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    debug: process.env.NODE_ENV === 'development'
  }
});

// Enhanced auth methods with error handling and token refresh
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Authentication failed. Please check your credentials.');
  }
}

// Add token refresh handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    // Clear all storage on sign out
    sessionStorage.clear();
    localStorage.clear();
  }
});

export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');
    
    return data;
  } catch (error) {
    console.error('Signup failed:', error);
    throw new Error('Registration failed. Please try again.');
  }
}

export default supabase;