import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAuthStore } from '../../stores/auth-store'

export function AppShell() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
