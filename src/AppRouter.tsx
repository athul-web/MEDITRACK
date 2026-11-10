import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import App from './App';
import { PublicLayout } from './app/routes/PublicLayout';

import { HomePage } from './app/routes/home/HomePage';
import { HomePage as ModernHomePage } from './modern-ui/home/HomePage';
import { HospitalsPage as ModernHospitalsPage } from './modern-ui/hospitals/HospitalsPage';
import { AboutPage as ModernAboutPage } from './modern-ui/about/AboutPage';
import { ContactPage as ModernContactPage } from './modern-ui/contact/ContactPage';
import { HospitalsPage } from './app/routes/hospitals/HospitalsPage';
import { HospitalDetailsPage } from './app/routes/hospitals/HospitalDetailsPage';
import { ContactPage } from './app/routes/contact/ContactPage';
import { AboutPage } from './app/routes/about/AboutPage';
import { TermsPage } from './app/routes/terms/TermsPage';
import { CookiesPage } from './app/routes/cookies/CookiesPage';
import { Login } from './components/Login';
import { Shell } from './operator-dashboard/components/layout/Shell';
import { Equipment as OperatorEquipment } from './operator-dashboard/pages/EquipmentPage';
import { Overview as OperatorOverview } from './operator-dashboard/pages/OverviewPage';
import { Maintenance as OperatorMaintenance } from './operator-dashboard/pages/MaintenancePage';
import { ProblemReports as OperatorProblemReports } from './operator-dashboard/pages/ProblemReportsPage';
import { LiveMonitoring as OperatorLiveMonitoring } from './operator-dashboard/pages/LiveMonitoringPage';
import { ResourceStatus as OperatorResourceStatus } from './operator-dashboard/pages/ResourceStatusPage';
import { Settings as OperatorSettings } from './operator-dashboard/pages/SettingsPage';
import { DoctorDirectoryManagement } from './operator-dashboard/pages/DoctorDirectoryManagementPage';
import { HospitalDoctorManagement } from './operator-dashboard/pages/HospitalDoctorManagementPage';

function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkAccess() {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) {
          if (isActive) setIsAuthorized(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const role = profile?.role;
        const permittedRoles = allowedRoles ?? ['Staff', 'Admin', 'doctor_admin', 'super_admin'];
        if (isActive) setIsAuthorized(permittedRoles.includes(role));
      } catch (err: any) {
        console.error('Auth access check failed:', err);
        if (isActive) setIsAuthorized(false);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Re-run the full role check on any auth state change.
      checkAccess();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-page)] gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-brand-blue)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">
          Verifying clinical session...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <ModernHomePage />
          }
        />

        <Route
          path="/hospitals"
          element={
            <ModernHospitalsPage />
          }
        />

        <Route
          path="/hospitals/:id"
          element={
            <PublicLayout>
              <HospitalDetailsPage />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <ModernAboutPage />
          }
        />

        <Route
          path="/contact"
          element={
            <ModernContactPage />
          }
        />

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Legacy protected hospital dashboard (retained during UI migration) */}
        <Route
          path="/dashboard/legacy"
          element={
            <AuthGuard>
              <App />
            </AuthGuard>
          }
        />

        {/* New operator dashboard visual shell (preview only; real data wiring later) */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Shell />
            </AuthGuard>
          }
        >
          <Route index element={<OperatorOverview />} />
          <Route path="equipment" element={<OperatorEquipment />} />
          <Route path="maintenance" element={<OperatorMaintenance />} />
          <Route path="alerts" element={<OperatorProblemReports />} />
          <Route path="monitoring" element={<OperatorLiveMonitoring />} />
          <Route path="resources" element={<OperatorResourceStatus />} />
          <Route path="settings" element={<OperatorSettings />} />
          <Route
            path="doctors"
            element={
              <AuthGuard allowedRoles={['doctor_admin', 'super_admin']}>
                <DoctorDirectoryManagement />
              </AuthGuard>
            }
          />
          <Route
            path="hospital-doctors"
            element={
              <AuthGuard allowedRoles={['Staff', 'Admin']}>
                <HospitalDoctorManagement />
              </AuthGuard>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-sm text-neutral-600">
                Operator dashboard shell connected. Feature sections will be wired in subsequent stages.
              </div>
            }
          />
        </Route>
        {/* Redirect any unmatched routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}