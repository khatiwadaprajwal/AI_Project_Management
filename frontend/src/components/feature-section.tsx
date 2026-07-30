import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Check, X, Sparkles, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import * as taskApi from '@/lib/api/task'
import { useTaskSuggestions, useGenerateTaskSuggestions, useAcceptTaskSuggestion, useRejectTaskSuggestion } from '@/hooks/use-ai-suggestion'
import { useSubtaskSuggestions, useGenerateSubtaskSuggestions, useAcceptSubtaskSuggestion, useRejectSubtaskSuggestion } from '@/hooks/use-ai-suggestion'
import { useCreateTask, useUpdateTaskStatus, useDeleteTask, useCreateSubtask, useUpdateSubtask, useDeleteSubtask, useTask } from '@/hooks/use-task'
import type { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface FeatureSectionProps {
  featureId: string
  featureName: string
  projectId: string
}

const statusStyles: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'> = {
  TODO: 'ghost',
  IN_PROGRESS: 'default',
  READY_FOR_QA: 'secondary',
  COMPLETED: 'outline',
  REOPENED: 'secondary',
  BLOCKED: 'destructive',
  CANCELLED: 'ghost',
}

const priorityColors: Record<string, string> = {
  LOW: 'text-slate-400',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
}

export function FeatureSection({ featureId, featureName, projectId }: FeatureSectionProps) {
  const [taskOpen, setTaskOpen] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [expandedSuggestions, setExpandedSuggestions] = useState(false)
  const createTask = useCreateTask()

  const { data: suggestions } = useTaskSuggestions(taskOpen ? featureId : undefined)
  const generateSuggestions = useGenerateTaskSuggestions()
  const acceptSuggestion = useAcceptTaskSuggestion()
  const rejectSuggestion = useRejectTaskSuggestion()

  return (
    <div className="border border-border rounded-md">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
        <div className="flex items-center gap-2 text-sm font-medium">
          <button onClick={() => setTaskOpen(!taskOpen)} className="text-muted-foreground">
            {taskOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          {featureName}
        </div>
        <Button size="xs" variant="ghost" onClick={() => generateSuggestions.mutate(featureId)} disabled={generateSuggestions.isPending}>
          <Sparkles className="size-3.5 mr-1" />
          {generateSuggestions.isPending ? 'Generating...' : 'AI suggest'}
        </Button>
      </div>

      {taskOpen && (
        <div className="p-3 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newTaskTitle) return
              createTask.mutate(
                { featureId, input: { title: newTaskTitle } },
                { onSuccess: () => setNewTaskTitle('') },
              )
            }}
            className="flex gap-2"
          >
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task title"
              className="flex-1 h-7 text-sm"
            />
            <Button type="submit" size="xs" disabled={!newTaskTitle || createTask.isPending}>
              <Plus className="size-3.5" />
            </Button>
          </form>

          {suggestions && suggestions.length > 0 && (
            <div className="space-y-1">
              <button
                onClick={() => setExpandedSuggestions(!expandedSuggestions)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedSuggestions ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                <Sparkles className="size-3" />
                {suggestions.length} AI suggestion{suggestions.length > 1 ? 's' : ''}
              </button>

              {expandedSuggestions && (
                <div className="space-y-1 pl-3 border-l-2 border-muted">
                  {suggestions.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 py-1 px-2 rounded bg-muted/50 text-sm">
                      <span className="flex-1 text-xs">{s.title}</span>
                      {s.priority && (
                        <span className={`text-[10px] font-medium ${priorityColors[s.priority] ?? ''}`}>{s.priority}</span>
                      )}
                      <button
                        onClick={() => acceptSuggestion.mutate({ featureId, suggestionId: s.id })}
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        onClick={() => rejectSuggestion.mutate({ featureId, suggestionId: s.id })}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <TaskList featureId={featureId} projectId={projectId} />
        </div>
      )}
    </div>
  )
}

function TaskList({ featureId, projectId }: { featureId: string; projectId: string }) {
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'project', projectId, 'feature', featureId],
    queryFn: async () => {
      const res = await taskApi.listTasksByProject(projectId, { featureId })
      return res.data.data
    },
    enabled: !!projectId && !!featureId,
  })

  const tasks = tasksData?.tasks ?? []

  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground py-1">No tasks yet.</p>
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}

function TaskItem({ task: initialTask }: { task: Task }) {
  const [expanded, setExpanded] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [subSuggestOpen, setSubSuggestOpen] = useState(false)
  const updateStatus = useUpdateTaskStatus()
  const deleteTask = useDeleteTask()
  const createSubtask = useCreateSubtask()
  const updateSubtask = useUpdateSubtask()
  const deleteSubtask = useDeleteSubtask()

  const { data: fullTask } = useTask(expanded ? initialTask.id : undefined)
  const task = fullTask ?? initialTask
  const subtasks = task.subtasks ?? []

  const { data: subtaskSuggestions } = useSubtaskSuggestions(expanded ? task.id : undefined)
  const generateSubtaskSuggestions = useGenerateSubtaskSuggestions()
  const acceptSubtaskSuggestion = useAcceptSubtaskSuggestion()
  const rejectSubtaskSuggestion = useRejectSubtaskSuggestion()

  return (
    <div className="rounded border border-border/60 px-2.5 py-1.5 text-sm">
      <div className="flex items-center gap-2">
        <GripVertical className="size-3 text-muted-foreground shrink-0 cursor-grab" />
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground">
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>
        <span className="flex-1 text-xs">{task.title}</span>
        <span className={`text-[10px] font-medium ${priorityColors[task.priority] ?? ''}`}>{task.priority}</span>
        <Badge variant={statusStyles[task.status] ?? 'ghost'} className="text-[10px] px-1.5 py-0 h-4">
          {task.status.replace(/_/g, ' ')}
        </Badge>
        <button
          onClick={() => deleteTask.mutate({ taskId: task.id })}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="mt-2 space-y-2 pl-5 border-l-2 border-muted">
          <div className="flex flex-wrap gap-1">
            {['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus.mutate({
                  taskId: task.id,
                  input: { status: s as any, blockedReason: s === 'BLOCKED' ? 'Manually blocked' : undefined },
                })}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  task.status === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {subtasks.length > 0 && (
            <div className="space-y-1">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => updateSubtask.mutate({ subtaskId: st.id, input: { isDone: !st.isDone } })}
                    className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                      st.isDone ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                    }`}
                  >
                    {st.isDone && <Check className="size-2.5" />}
                  </button>
                  <span className={`flex-1 ${st.isDone ? 'line-through text-muted-foreground' : ''}`}>{st.title}</span>
                  <button
                    onClick={() => deleteSubtask.mutate(st.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!subtaskTitle) return
              createSubtask.mutate(
                { taskId: task.id, input: { title: subtaskTitle } },
                { onSuccess: () => setSubtaskTitle('') },
              )
            }}
            className="flex gap-2"
          >
            <Input
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              placeholder="Subtask"
              className="flex-1 h-6 text-xs"
            />
            <Button type="submit" size="xs" disabled={!subtaskTitle}>
              <Plus className="size-3" />
            </Button>
          </form>

          <div>
            <button
              onClick={() => {
                setSubSuggestOpen(!subSuggestOpen)
                if (!subSuggestOpen) generateSubtaskSuggestions.mutate(task.id)
              }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sparkles className="size-3" />
              AI subtask suggestions
            </button>

            {subSuggestOpen && subtaskSuggestions && subtaskSuggestions.length > 0 && (
              <div className="mt-1 space-y-1">
                {subtaskSuggestions.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 py-0.5 px-1.5 rounded bg-muted/50 text-xs">
                    <span className="flex-1">{s.title}</span>
                    <button
                      onClick={() => acceptSubtaskSuggestion.mutate({ taskId: task.id, suggestionId: s.id })}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="size-3" />
                    </button>
                    <button
                      onClick={() => rejectSubtaskSuggestion.mutate({ taskId: task.id, suggestionId: s.id })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
