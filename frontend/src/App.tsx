import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import RegisterPage from '@/pages/RegisterPage'
import VerifyOtpPage from '@/pages/VerifyOtpPage'
import LoginPage from '@/pages/LoginPage'
import WorkspaceSettingsPage from '@/pages/workspace-settings'
import ProjectDetailPage from '@/pages/project-detail'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProjectList } from '@/components/project-list'

function HomePage() {
  return <ProjectList />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/workspace-settings" element={<WorkspaceSettingsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
      </Route>
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
    </Routes>
  )
}
