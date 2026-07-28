import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../stores/auth-store'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'My tasks', icon: CheckSquare },
  { to: '/members', label: 'Members', icon: Users },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuthStore()

  const inner = (
    <aside className="flex h-full w-56 flex-col bg-surface p-3 border-r border-border">
      <div className="pb-4 text-md font-medium text-slate-900">SDLC Manager</div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent-soft text-accent font-medium'
                  : 'text-ink-muted hover:bg-slate-100',
              )
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-2 space-y-0.5">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink-muted hover:bg-slate-100 transition-colors"
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink-muted hover:bg-slate-100 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={onClose} />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-56 transition-transform duration-200 md:static md:z-auto md:block',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {inner}
      </div>
    </>
  )
}
