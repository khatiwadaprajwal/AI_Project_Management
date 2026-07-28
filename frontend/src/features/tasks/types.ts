export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'READY_FOR_QA' | 'COMPLETED' | 'REOPENED' | 'BLOCKED' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

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
  deletedAt: string | null
  deletedBy: string | null
  deleteReason: string | null
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

export interface TaskListResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
