import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import RegisterPage from '@/pages/RegisterPage'
import VerifyOtpPage from '@/pages/VerifyOtpPage'
import LoginPage from '@/pages/LoginPage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function HomePage() {
  const { user, workspaces, logout } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
          <div>
            <h3 className="font-medium mb-2">Workspaces</h3>
            {workspaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workspaces</p>
            ) : (
              <ul className="space-y-1">
                {workspaces.map((ws) => (
                  <li key={ws.id} className="text-sm">
                    {ws.name} <span className="text-muted-foreground">({ws.role})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
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
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
    </Routes>
  )
}
