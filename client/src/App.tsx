import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import supabase from './components/Auth/supabaseClient';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard/dashboard';
import SidebarLayout from './components/Layout/SidebarLayout';
import AuthenticatedRoute from './components/Auth/authenticatedRoute';
import InvoiceForm from './pages/CreateInvoices/create-invoice';
import InvoicePublicView from './pages/InvoicePublicView/InvoicePublicView';
import type { 
  Subscription,
  AuthChangeEvent,
  Session 
} from '@supabase/supabase-js';
import './App.css';
import './global.css';
import './index.css';
import SettingsPage from './pages/Settings/settings';
import OnboardingPage from './pages/Onboarding/page';
import ContactPage from './pages/Contact/contact';
import { LoadingSpinner } from "./components/ui/loadingSpinner";
import AuthCallback from './pages/auth-callback'


// SidebarLayout already includes the Outlet component

async function checkBusinessSheet(supabaseToken: string, googleToken: string) {
  try {
    const response = await fetch("https://sheetbills-server.vercel.app/api/check-business-sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-supabase-token": supabaseToken
      },
      body: JSON.stringify({ accessToken: googleToken }),
    });

    if (!response.ok) throw new Error("Business sheet check failed");
    
    const { hasBusinessSheet } = await response.json();
    return hasBusinessSheet;
  } catch (error) {
    console.error("Business sheet check error:", error);
    return false;
  }
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    let authSubscription: Subscription;

    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', { event, session: !!session });
      if (!isMounted) return;

      if (session) {
        console.log('Setting user session');
        sessionStorage.setItem('sb-auth-token', JSON.stringify(session));
        localStorage.setItem('sb-auth-token', JSON.stringify(session));
        setUser(session.user);
      } else {
        console.log('Clearing user session');
        sessionStorage.removeItem('sb-auth-token');
        localStorage.removeItem('sb-auth-token');
        setUser(null);
      }
      setLoading(false);
    };

    // Get initial session
    console.log('Getting initial session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', { hasSession: !!session });
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    authSubscription = subscription;

    return () => {
      console.log('Cleaning up auth subscription');
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  // Add location change logging
  useEffect(() => {
    console.log('Location changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      user: !!user,
      loading
    });
  }, [location, user, loading]);

  if (loading) {
    console.log('App is in loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
    
        {/* Onboarding Route */}
        <Route
          path="/Onboarding"
          element={
            <AuthenticatedRoute authenticated={!!user} isLoading={loading}>
              <OnboardingPage />
            </AuthenticatedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <AuthenticatedRoute authenticated={!!user} isLoading={loading}>
              <SidebarLayout />
            </AuthenticatedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/invoices" />} />
          <Route path="/invoices" element={<Dashboard />} />
          <Route path="/create-invoice" element={<InvoiceForm />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/invoice/view/:token" element={<InvoicePublicView />} />
  
        </Route>

        {/* Catch all route */}
        <Route path="*" element={
          <Navigate to={user ? "/invoices" : "/login"} />
        } />
      </Routes>
    </HelmetProvider>
  );
}

export default App;