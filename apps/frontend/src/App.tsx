import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { AppLayout, AuthLayout } from '@/components/layout'
import { ProtectedRoute, RedirectIfAuthenticated } from '@/components/auth'
import { ImpersonateHandler } from '@/components/ImpersonateHandler'
import { LoginPage, SignUpPage, SignUpSuccessPage, ConfirmEmailPage, EmailNotVerifiedPage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage, SessionsPage, DashboardPage, WorkspacesPage, WorkspaceSettingsPage, BillingPage } from '@/pages'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ImpersonateHandler />
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth routes - Redirect if authenticated */}
            <Route element={
              <RedirectIfAuthenticated>
                <AuthLayout />
              </RedirectIfAuthenticated>
            }>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Email verification routes - No auth redirect */}
            <Route element={<AuthLayout />}>
              <Route path="/signup/success" element={<SignUpSuccessPage />} />
              <Route path="/confirm-email" element={<ConfirmEmailPage />} />
              <Route path="/email-not-verified" element={<EmailNotVerifiedPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<div>Perfil (Em desenvolvimento)</div>} />
              <Route path="/settings/workspaces" element={<WorkspacesPage />} />
              <Route path="/settings/workspace/:workspaceId" element={<WorkspaceSettingsPage />} />
              <Route path="/settings/billing" element={<BillingPage />} />
              <Route path="/settings/sessions" element={<SessionsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App