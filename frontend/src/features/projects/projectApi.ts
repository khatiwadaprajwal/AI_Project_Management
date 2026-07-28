import apiClient from '../../lib/api-client'
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectListResponse, ListProjectsQuery } from './types'
import type { ApiResponse } from '../auth/authApi'

export const projectApi = {
  list: (workspaceId: string, query?: ListProjectsQuery) =>
    apiClient.get<ApiResponse<ProjectListResponse>>(`/workspaces/${workspaceId}/projects`, { params: query }),

  get: (workspaceId: string, projectId: string) =>
    apiClient.get<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}`),

  create: (workspaceId: string, data: CreateProjectInput) =>
    apiClient.post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, data),

  update: (workspaceId: string, projectId: string, data: UpdateProjectInput) =>
    apiClient.patch<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}`, data),

  updateStatus: (workspaceId: string, projectId: string, status: string) =>
    apiClient.patch<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}/status`, { status }),

  delete: (workspaceId: string, projectId: string, deleteReason?: string) =>
    apiClient.delete<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}`, { data: { deleteReason } }),

  restore: (workspaceId: string, projectId: string) =>
    apiClient.post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}/restore`),
}
