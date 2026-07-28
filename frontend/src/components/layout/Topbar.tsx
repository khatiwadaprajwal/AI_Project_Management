import { Bell, Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/auth-store'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, workspaces, activeWorkspaceId } = useAuthStore()
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-ink-muted hover:text-slate-700 md:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <span className="text-sm text-ink-muted">
          {activeWorkspace?.name ?? 'Workspace'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Bell size={18} className="text-ink-muted" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-medium text-accent">
          {initials ?? 'U'}
        </div>
      </div>
    </header>
  )
}
