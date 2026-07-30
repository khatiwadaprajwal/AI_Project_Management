import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Trash2, UserMinus, Loader2 } from 'lucide-react'
import { useActiveWorkspace, useWorkspaceMembers, useUpdateWorkspace, useInviteMember, useRemoveMember, useDeleteWorkspace, useCreateWorkspace } from '@/hooks/use-workspace'
import { useWorkspaceStore } from '@/store/workspace-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'members', label: 'Members' },
  { id: 'danger', label: 'Danger zone' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function WorkspaceSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') || 'general'
  const tab = (tabs.find((t) => t.id === rawTab)?.id ?? 'general') as TabId
  const setTab = (t: TabId) => setSearchParams({ tab: t })

  if (rawTab === 'create') return <CreateWorkspaceTab onCreated={() => setTab('general')} />

  const { workspace } = useActiveWorkspace()

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{workspace.name}</p>
      </div>

      <div className="flex gap-1 border-b border-border pb-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors',
              tab === t.id
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && <GeneralTab workspaceId={workspace.id} workspaceName={workspace.name} />}
      {tab === 'members' && <MembersTab workspaceId={workspace.id} />}
      {tab === 'danger' && <DangerTab workspaceId={workspace.id} />}
    </div>
  )
}

function GeneralTab({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const [name, setName] = useState(workspaceName)
  const updateMutation = useUpdateWorkspace()
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    updateMutation.mutate(
      { id: workspaceId, input: { name } },
      {
        onSuccess: () => setMessage('Workspace name updated.'),
        onError: () => setMessage('Failed to update workspace.'),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace name</CardTitle>
        <CardDescription>Change the display name of this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" disabled={!name || updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
          </Button>
        </form>
        {message && (
          <p className="text-sm text-muted-foreground mt-2">{message}</p>
        )}
      </CardContent>
    </Card>
  )
}

function MembersTab({ workspaceId }: { workspaceId: string }) {
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId)
  const inviteMutation = useInviteMember()
  const removeMutation = useRemoveMember()
  const [email, setEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [error, setError] = useState('')

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !inviteName) return
      inviteMutation.mutate(
        { workspaceId, input: { email, name: inviteName, role: 'DEVELOPER' } },
      {
        onSuccess: () => { setEmail(''); setInviteName('') },
        onError: () => setError('Failed to invite user.'),
      },
    )
  }

  const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'ghost'> = {
    OWNER: 'default',
    ADMIN: 'secondary',
    LEAD: 'outline',
    DEVELOPER: 'ghost',
    QA: 'ghost',
    SUPERVISOR: 'outline',
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
          <CardDescription>Send an invitation to join this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="invite-name">Name</Label>
              <Input id="invite-name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <Button type="submit" disabled={!email || !inviteName || inviteMutation.isPending}>
              {inviteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Send invite'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members ({members?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : members?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members.</p>
          ) : (
            members?.map((m) => (
              <div key={m.userId} className="flex items-center justify-between py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={roleBadgeVariant[m.role] ?? 'outline'}>{m.role}</Badge>
                  {m.role !== 'OWNER' && (
                    <button
                      onClick={() => removeMutation.mutate({ workspaceId, userId: m.userId })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <UserMinus className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DangerTab({ workspaceId }: { workspaceId: string }) {
  const deleteMutation = useDeleteWorkspace()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState('')

  const handleDelete = () => {
    if (confirm !== 'DELETE') return
    deleteMutation.mutate(workspaceId, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Delete workspace</CardTitle>
        <CardDescription>
          Permanently delete this workspace and all of its data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert variant="destructive">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            All projects, tasks, and member data will be removed. Type <strong>DELETE</strong> to confirm.
          </AlertDescription>
        </Alert>
        <Input
          placeholder='Type "DELETE" to confirm'
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button
          variant="destructive"
          disabled={confirm !== 'DELETE' || deleteMutation.isPending}
          onClick={handleDelete}
        >
          {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          Delete workspace
        </Button>
      </CardContent>
    </Card>
  )
}

function CreateWorkspaceTab({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const createMutation = useCreateWorkspace()
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    createMutation.mutate(
      { name },
      {
        onSuccess: (res) => {
          setActiveWorkspace(res.data.data.id)
          onCreated()
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create workspace</CardTitle>
        <CardDescription>Start a new workspace for your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="ws-name">Name</Label>
            <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My workspace" />
          </div>
          <Button type="submit" disabled={!name || createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Create'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
