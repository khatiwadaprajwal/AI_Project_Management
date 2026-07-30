import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader2, ExternalLink, ChevronDown, ChevronRight, Bookmark } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useActiveWorkspace, useWorkspaceMembers } from '@/hooks/use-workspace'
import { useProjects, useCreateProject } from '@/hooks/use-project'
import { useFeatures } from '@/hooks/use-feature'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusStyles: Record<string, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  ON_HOLD: 'secondary',
  COMPLETED: 'outline',
}

export function ProjectList() {
  const { user } = useAuthStore()
  const { workspace } = useActiveWorkspace()
  const { data: members } = useWorkspaceMembers(workspace?.id)
  const { data, isLoading } = useProjects()
  const createMutation = useCreateProject()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    clientName: '',
    description: '',
    leadId: '',
    startDate: '',
    dueDate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    createMutation.mutate(
      {
        name: form.name,
        clientName: form.clientName || undefined,
        description: form.description || undefined,
        leadId: form.leadId || undefined,
        startDate: form.startDate || undefined,
        dueDate: form.dueDate || undefined,
      },
      {
        onSuccess: () => {
          setForm({ name: '', clientName: '', description: '', leadId: '', startDate: '', dueDate: '' })
          setShowForm(false)
        },
      },
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {workspace?.name ?? 'No active workspace'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Add a new project to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="p-name">Name</Label>
                <Input id="p-name" name="name" value={form.name} onChange={handleChange} placeholder="Project name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-client">Client name</Label>
                <Input id="p-client" name="clientName" value={form.clientName} onChange={handleChange} placeholder="Acme Corp" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-desc">Description</Label>
                <Input id="p-desc" name="description" value={form.description} onChange={handleChange} placeholder="Brief description" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-lead">Lead</Label>
                <select
                  id="p-lead"
                  name="leadId"
                  value={form.leadId}
                  onChange={handleChange}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">No lead</option>
                  {members?.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} — {m.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="p-start">Start date</Label>
                  <Input id="p-start" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="p-due">Due date</Label>
                  <Input id="p-due" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={!form.name || createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No projects yet. Create your first project.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: { id: string; name: string; clientName: string | null; status: string } }) {
  const [expanded, setExpanded] = useState(false)
  const { data: featuresData } = useFeatures(expanded ? project.id : undefined)
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent
        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {expanded ? <ChevronDown className="size-4 text-muted-foreground shrink-0" /> : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
          <div>
            <p className="text-sm font-medium">{project.name}</p>
            {project.clientName && (
              <p className="text-xs text-muted-foreground">{project.clientName}</p>
            )}
          </div>
        </div>
        <Badge variant={statusStyles[project.status] ?? 'outline'}>{project.status}</Badge>
      </CardContent>

      {expanded && (
        <div className="px-4 pb-3 space-y-1 border-t border-border pt-2">
          {!featuresData ? (
            <div className="flex justify-center py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : featuresData.features.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">No features yet.</p>
          ) : (
            featuresData.features.map((f) => (
              <div key={f.id} className="flex items-center gap-2 py-1 text-sm">
                <Bookmark className="size-3.5 text-muted-foreground shrink-0" />
                <span>{f.name}</span>
              </div>
            ))
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground mt-1"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/projects/${project.id}`)
            }}
          >
            <ExternalLink className="size-3 mr-1" />
            View project details
          </Button>
        </div>
      )}
    </Card>
  )
}
