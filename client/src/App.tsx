import { useState, useEffect, useCallback } from 'react';
import { Route, Routes, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard/dashboard';
import SidebarLayout from './components/Layout/SidebarLayout';
import AuthenticatedRoute from './components/Auth/authenticatedRoute';
import InvoiceForm from './pages/CreateInvoices/create-invoice';
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
import PublicInvoice from "./pages/PublicInvoice/PublicInvoice";
import PrintInvoice from './pages/PrintInvoice/print-invoice';
import EmailInvoice from './pages/EmailInvoice/email-invoice';
import LegalPage from './pages/Legal/legal';
import LandingPage from './pages/Landing/page';
import AccountStatus from './pages/AccountStatus/AccountStatus';
import ReportsPage from "./pages/Reports/reports"
// import TemplateDesignerPage from './components/TemplateDesigner/TemplateDesignerPage';
// SidebarLayout already includes the Outlet component

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
  const [onboardingChecked, setOnboardingChecked] = useState(false);
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
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', { hasSession: !!session });
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(handleAuthStateChange);
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

  // Onboarding check logic
  useEffect(() => {
    // Only run after user is loaded and not loading
    if (!loading && user) {
      const checkOnboardingStatus = async () => {
        try {
          // Get Supabase session for Google token
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (!session) return;
          const googleToken = session.provider_token;
          if (!googleToken) return;
          // Call backend onboarding status endpoint
          const response = await fetch('https://sheetbills-server.vercel.app/api/onboarding/status', {
            headers: {
              'Authorization': `Bearer ${googleToken}`,
            },
          });
          const data = await response.json();
          // If not onboarded and not already on onboarding page, redirect
          if (!data.onboarded && location.pathname !== '/Onboarding') {
            navigate('/Onboarding', { replace: true });
          }
          // If onboarded and on onboarding page, redirect to dashboard
          if (data.onboarded && location.pathname === '/Onboarding') {
            navigate('/invoices', { replace: true });
          }
          setOnboardingChecked(true);
        } catch (error) {
          console.error('Onboarding status check failed:', error);
        }
      };
      checkOnboardingStatus();
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading || (user && !onboardingChecked)) {
    // Show loading spinner until onboarding check is done
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
    <HelmetProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/account-status" element={<AccountStatus />} />
    
        {/* Onboarding Route */}
        <Route
          path="/Onboarding"
          element={
              <AuthenticatedRoute isLoading={loading}>
              <OnboardingPage />
            </AuthenticatedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
              <AuthenticatedRoute isLoading={loading}>
              <SidebarLayout />
            </AuthenticatedRoute>
          }
        >
          <Route path="/invoices" element={<Dashboard />} />
          <Route path="/create-invoice" element={<InvoiceForm />} />
          <Route path="/email-invoice/:invoiceId" element={<EmailInvoice />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* Public Invoice Route - must be after catch-all to take precedence */}
        <Route path="/invoice/shared/:token" element={<PublicInvoice />} />

        {/* Add print-invoice route OUTSIDE the SidebarLayout group */}
        <Route
          path="/print-invoice/:invoiceId"
          element={
              <AuthenticatedRoute isLoading={loading}>
              <PrintInvoice />
            </AuthenticatedRoute>
          }
        />

        {/* Catch all route - redirect to landing page for unauthenticated users */}
        <Route path="*" element={
          <Navigate to={user ? "/invoices" : "/"} />
        } />
      </Routes>
    </HelmetProvider>
    </SessionContextProvider>
  );
}

export default App;