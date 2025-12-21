import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth-store';
import { ThemeProvider } from './contexts/theme-context';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { Toaster } from './components/ui/toaster';
import { ManagerLoginPage } from './pages/login';
import { UsersPage } from './pages/users';
import { UserDetailsPage } from './pages/user-details';
import { MetricsPage } from './pages/metrics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ManagerLayout>{children}</ManagerLayout>;
};

export const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/users" replace /> : <ManagerLoginPage />
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/:id"
              element={
                <ProtectedRoute>
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/metrics"
              element={
                <ProtectedRoute>
                  <MetricsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};
