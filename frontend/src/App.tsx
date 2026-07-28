import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { useAuthStore } from './stores/auth-store'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { MyTasksPage } from './pages/MyTasksPage'
import { MembersPage } from './pages/MembersPage'
import { SettingsPage } from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.isFirstLogin) return <Navigate to="/change-password" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuthStore()
  if (user && accessToken && !user.isFirstLogin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<MyTasksPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
