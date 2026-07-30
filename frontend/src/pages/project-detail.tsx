import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, Plus, Pencil, GripVertical } from 'lucide-react'
import { useProject, useUpdateProject, useUpdateProjectStatus, useDeleteProject } from '@/hooks/use-project'
import { useFeatures, useCreateFeature, useUpdateFeature, useDeleteFeature, useReorderFeature } from '@/hooks/use-feature'
import { PROJECT_STATUSES } from '@/types/project'
import type { ProjectStatus } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { FeatureSection } from '@/components/feature-section'

const statusStyles: Record<string, 'default' | 'secondary' | 'outline'> = {
  ACTIVE: 'default',
  ON_HOLD: 'secondary',
  COMPLETED: 'outline',
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading } = useProject(projectId)
  const updateMutation = useUpdateProject()
  const statusMutation = useUpdateProjectStatus()
  const deleteMutation = useDeleteProject()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const { data: featuresData, isLoading: featuresLoading } = useFeatures(projectId)
  const createFeatureMutation = useCreateFeature()
  const updateFeatureMutation = useUpdateFeature()
  const deleteFeatureMutation = useDeleteFeature()
  const reorderFeatureMutation = useReorderFeature()
  const [newFeatureName, setNewFeatureName] = useState('')
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null)
  const [editingFeatureName, setEditingFeatureName] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Project not found.
        </CardContent>
      </Card>
    )
  }

  const handleEdit = () => {
    setName(project.name)
    setClientName(project.clientName ?? '')
    setDescription(project.description ?? '')
    setEditing(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(
      { projectId: project.id, input: { name, clientName: clientName || undefined, description: description || undefined } },
      { onSuccess: () => setEditing(false) },
    )
  }

  const handleStatusChange = (status: ProjectStatus) => {
    statusMutation.mutate({ projectId: project.id, input: { status } })
  }

  const handleDelete = () => {
    if (deleteConfirm !== 'DELETE') return
    deleteMutation.mutate(project.id, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold truncate">{project.name}</h1>
          {project.clientName && (
            <p className="text-sm text-muted-foreground">{project.clientName}</p>
          )}
        </div>
        <Badge variant={statusStyles[project.status] ?? 'outline'}>{project.status}</Badge>
      </div>

      <div className="flex gap-2">
        {PROJECT_STATUSES.map((s) => (
          <Button
            key={s}
            variant={project.status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange(s)}
            disabled={statusMutation.isPending}
          >
            {s.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-client">Client</Label>
                <Input id="edit-client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-desc">Description</Label>
                <Input id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={!name || updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Client:</span>{' '}
              {project.clientName ?? <span className="text-muted-foreground italic">None</span>}
            </div>
            <div>
              <span className="text-muted-foreground">Description:</span>{' '}
              {project.description ?? <span className="text-muted-foreground italic">None</span>}
            </div>
            {project.startDate && (
              <div><span className="text-muted-foreground">Start:</span> {new Date(project.startDate).toLocaleDateString()}</div>
            )}
            {project.dueDate && (
              <div><span className="text-muted-foreground">Due:</span> {new Date(project.dueDate).toLocaleDateString()}</div>
            )}
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>Edit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>{featuresData?.features.length ?? 0} features in this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newFeatureName || !projectId) return
              createFeatureMutation.mutate(
                { projectId, input: { name: newFeatureName } },
                { onSuccess: () => setNewFeatureName('') },
              )
            }}
            className="flex gap-2"
          >
            <Input
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              placeholder="New feature name"
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!newFeatureName || createFeatureMutation.isPending}>
              <Plus className="size-4" />
            </Button>
          </form>

          {featuresLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : !featuresData || featuresData.features.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No features yet.</p>
          ) : (
            <div className="space-y-2">
              {featuresData.features.map((f, idx) => (
                <div key={f.id}>
                  <div className="flex items-center gap-2 mb-1">
                  <span
                    className="size-3.5 text-muted-foreground shrink-0 cursor-grab inline-flex"
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (dragIndex === null || dragIndex === idx) return
                      reorderFeatureMutation.mutate({ featureId: f.id, input: { order: dragIndex } })
                      setDragIndex(null)
                    }}
                    onDragEnd={() => setDragIndex(null)}
                  >
                    <GripVertical className="size-3.5" />
                  </span>
                    {editingFeatureId === f.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (!editingFeatureName) return
                          updateFeatureMutation.mutate(
                            { featureId: f.id, input: { name: editingFeatureName } },
                            { onSuccess: () => setEditingFeatureId(null) },
                          )
                        }}
                        className="flex flex-1 gap-2"
                      >
                        <Input
                          value={editingFeatureName}
                          onChange={(e) => setEditingFeatureName(e.target.value)}
                          className="h-7 text-sm flex-1"
                        />
                        <Button type="submit" size="xs">Save</Button>
                        <Button type="button" size="xs" variant="ghost" onClick={() => setEditingFeatureId(null)}>Cancel</Button>
                      </form>
                    ) : (
                      <button onClick={() => { setEditingFeatureId(f.id); setEditingFeatureName(f.name) }} className="text-muted-foreground hover:text-foreground ml-auto">
                        <Pencil className="size-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteFeatureMutation.mutate({ featureId: f.id, projectId: projectId! })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  <FeatureSection featureId={f.id} featureName={f.name} projectId={projectId!} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Delete project</CardTitle>
          <CardDescription>Permanently remove this project.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </AlertDescription>
          </Alert>
          <Input
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <Button
            variant="destructive"
            disabled={deleteConfirm !== 'DELETE' || deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete project
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
