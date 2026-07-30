import { Plus, Check, ChevronsUpDown, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useActiveWorkspace, useWorkspaces } from '@/hooks/use-workspace'
import { useWorkspaceStore } from '@/store/workspace-store'
import { cn } from '@/lib/utils'

interface WorkspaceSwitcherProps {
  collapsed: boolean
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const { workspace } = useActiveWorkspace()
  const { data: workspaces } = useWorkspaces()
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground outline-none',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex size-5 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
          {workspace?.name?.charAt(0)?.toUpperCase() ?? 'W'}
        </div>
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">{workspace?.name ?? 'Workspaces'}</span>
            <ChevronsUpDown className="size-3 shrink-0 text-sidebar-foreground/50" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>

        {workspaces?.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className="flex items-center gap-2"
          >
            <div className="flex size-5 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {ws.name.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 truncate">{ws.name}</span>
            {ws.id === workspace?.id && <Check className="size-3.5 text-sidebar-foreground/70" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate('/workspace-settings?tab=general')}>
          <Settings className="size-4" />
          Manage workspace
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate('/workspace-settings?tab=create')}>
          <Plus className="size-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
