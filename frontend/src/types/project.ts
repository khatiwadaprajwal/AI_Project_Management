export const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export interface Project {
  id: string
  workspaceId: string
  name: string
  clientName: string | null
  description: string | null
  leadId: string | null
  startDate: string | null
  dueDate: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateProjectInput {
  name: string
  clientName?: string
  description?: string
  leadId?: string
  startDate?: string
  dueDate?: string
}

export interface UpdateProjectInput {
  name?: string
  clientName?: string
  description?: string
  leadId?: string
  startDate?: string
  dueDate?: string
}

export interface UpdateProjectStatusInput {
  status: ProjectStatus
}

export interface PaginatedResponse<T> {
  projects: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
