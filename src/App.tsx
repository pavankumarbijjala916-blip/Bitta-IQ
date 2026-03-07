import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';
import { ChatbotWidget } from "@/components/common/ChatbotWidget";
import { BottomNav } from "@/components/layout/BottomNav";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterAccount from "./pages/RegisterAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import RegisterBattery from "./pages/RegisterBattery";
import BatteryResults from "./pages/BatteryResults";
import BatteryMonitor from "./pages/BatteryMonitor";
import BatteryDetails from "./pages/BatteryDetails";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Comparison from "./pages/Comparison";
import PassportView from "./pages/PassportView";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

// React Query client
const queryClient = new QueryClient();

// ---------- Route Types ----------
type RouteProps = {
  children: React.ReactNode;
};

// ---------- Protected Route ----------
const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ---------- Public Route ----------
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ---------- App Routes ----------
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register-account"
        element={
          <PublicRoute>
            <RegisterAccount />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Reset password: do not use PublicRoute so users arriving from the email link (with recovery session) see the form instead of being redirected to dashboard */}
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/register"
        element={
          <ProtectedRoute>
            <RegisterBattery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <BatteryResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/monitor"
        element={
          <ProtectedRoute>
            <BatteryMonitor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/battery/:id"
        element={
          <ProtectedRoute>
            <BatteryDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/comparison"
        element={
          <ProtectedRoute>
            <Comparison />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/passport/:id"
        element={
          <ProtectedRoute>
            <PassportView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ---------- Main App ----------
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <div className="pb-24 md:pb-0">
                  <AppRoutes />
                </div>
                {/* AI-Powered Chatbot Widget */}
                <ChatbotWidget />
                <VoiceAssistant />
                <BottomNav />
              </TooltipProvider>
            </AuthProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
