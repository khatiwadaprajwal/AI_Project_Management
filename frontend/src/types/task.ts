export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'READY_FOR_QA', 'COMPLETED', 'REOPENED', 'BLOCKED', 'CANCELLED'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export interface Task {
  id: string
  featureId: string
  projectId: string
  title: string
  description: string | null
  assigneeId: string | null
  estimateDays: number | null
  startDate: string | null
  dueDate: string | null
  status: TaskStatus
  blockedReason: string | null
  priority: TaskPriority
  storyPoints: number | null
  order: number
  createdAt: string
  updatedAt: string
  subtasks?: Subtask[]
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  isDone: boolean
  order: number
  createdAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  assigneeId?: string
  estimateDays?: number
  startDate?: string
  dueDate?: string
  priority?: TaskPriority
  storyPoints?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  estimateDays?: number
  startDate?: string
  dueDate?: string
  priority?: TaskPriority
  storyPoints?: number
}

export interface UpdateTaskStatusInput {
  status: TaskStatus
  blockedReason?: string
}

export interface AssignTaskInput {
  assigneeId: string | null
}

export interface ReorderInput {
  order: number
}

export interface CreateSubtaskInput {
  title: string
}

export interface UpdateSubtaskInput {
  title?: string
  isDone?: boolean
}

export interface AiSuggestion {
  id: string
  entityType: 'FEATURE' | 'TASK'
  entityId: string
  title: string
  description: string | null
  priority: TaskPriority | null
  estimateDays: number | null
  storyPoints: number | null
  rank: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export interface PaginatedTasks {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AcceptRejectResponse {
  createdEntity?: Task | Subtask
  nextSuggestion: AiSuggestion | null
}
