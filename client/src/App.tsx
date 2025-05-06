import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import supabase from './components/Auth/supabaseClient';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard/dashboard';
import Header from './components/Header/header';
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
import Reports from './pages/Reports/reports';

const AuthenticatedLayout = () => (
  <>
    <Header />
    <main className="container mx-auto p-4">
      <Outlet />
    </main>
  </>
);

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

  useEffect(() => {
    let isMounted = true;
    let authSubscription: Subscription;

    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (session) {
        sessionStorage.setItem('sb-auth-token', JSON.stringify(session));
        localStorage.setItem('sb-auth-token', JSON.stringify(session));
      } else {
        sessionStorage.removeItem('sb-auth-token');
        localStorage.removeItem('sb-auth-token');
      }

      setUser(session?.user ?? null);
      setLoading(false);
    };

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) throw error;
        if (session) await handleAuthStateChange('INITIAL_SESSION', session);
        else setLoading(false);
      } catch (error) {
        if (isMounted) setLoading(false);
      }
    };

    authSubscription = supabase.auth.onAuthStateChange(handleAuthStateChange).data.subscription;
    initializeAuth();

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        
        {/* Onboarding Route - Separate from other authenticated routes */}
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
              <AuthenticatedLayout />
            </AuthenticatedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/invoices" replace />} />
          <Route path="/invoices" element={<Dashboard />} />
          <Route path="/create-invoice" element={<InvoiceForm />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={
          <Navigate to={user ? "/invoices" : "/login"} replace />
        } />
      </Routes>
    </HelmetProvider>
  );
}

export default App;