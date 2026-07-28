export interface Project {
  id: string
  workspaceId: string
  name: string
  clientName: string | null
  description: string | null
  leadId: string | null
  startDate: string | null
  dueDate: string | null
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deletedBy: string | null
  deleteReason: string | null
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

export interface ListProjectsQuery {
  page?: number
  limit?: number
  status?: string
  clientName?: string
  leadId?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProjectListResponse {
  projects: Project[]
  pagination: PaginationMeta
}
