import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import App from './App';
import { Login } from './components/Login';

// Import new public pages
import { HomePage } from './app/routes/home/HomePage';
import { HospitalsPage } from './app/routes/hospitals/HospitalsPage';
import { AboutPage } from './app/routes/about/AboutPage';
import { ContactPage } from './app/routes/contact/ContactPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsAuthenticated(!!session);
      } catch (err: any) {
        console.error('Auth session check failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-page)] gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-brand-blue)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">Verifying clinical session...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Hospital Staff Dashboard */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <App />
            </AuthGuard>
          }
        />

        {/* Redirect any unmatched routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}