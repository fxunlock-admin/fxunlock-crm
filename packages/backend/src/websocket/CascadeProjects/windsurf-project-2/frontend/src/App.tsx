import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Affiliates from './pages/Affiliates';
import AffiliateDetail from './pages/AffiliateDetail';
import AffiliateEdit from './pages/AffiliateEdit';
import Brokers from './pages/Brokers';
import Revenue from './pages/Commissions';
import Users from './pages/Users';
import Staff from './pages/Staff';
import StaffDashboard from './pages/StaffDashboard';
import CompanyKpis from './pages/CompanyKpis';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliates"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Affiliates />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliates/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AffiliateDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliates/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AffiliateEdit />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/brokers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Brokers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Revenue />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Staff />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StaffDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-kpis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CompanyKpis />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
