import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { PageSkeleton } from '@/components/ui/page-skeleton'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/login'))
const SignupPage = lazy(() => import('@/pages/auth/signup'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'))
const EmailNotVerifiedPage = lazy(() => import('@/pages/auth/email-not-verified'))

const DashboardPage = lazy(() => import('@/pages/dashboard'))
const SessionsPage = lazy(() => import('@/pages/sessions'))
const WorkspacesPage = lazy(() => import('@/pages/workspaces'))
const WorkspaceSettingsPage = lazy(() => import('@/pages/workspace-settings'))
const BillingPage = lazy(() => import('@/pages/billing'))

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Auth route wrapper (redirect to dashboard if already authenticated)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton variant="dashboard" />}>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <LoginPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <SignupPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <ForgotPasswordPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <ResetPasswordPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<PageSkeleton variant="auth" />}>
              <VerifyEmailPage />
            </Suspense>
          }
        />
        <Route
          path="/email-not-verified"
          element={
            <Suspense fallback={<PageSkeleton variant="auth" />}>
              <EmailNotVerifiedPage />
            </Suspense>
          }
        />

        {/* App routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/workspaces"
          element={
            <ProtectedRoute>
              <WorkspacesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/workspace/:id"
          element={
            <ProtectedRoute>
              <WorkspaceSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
