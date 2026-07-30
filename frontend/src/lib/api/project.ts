import api from '@/lib/axios'
import type { Project, CreateProjectInput, UpdateProjectInput, UpdateProjectStatusInput, PaginatedResponse } from '@/types/project'

export function listProjects(workspaceId: string, params?: { status?: string; page?: number; limit?: number }) {
  return api.get<{ success: boolean; data: PaginatedResponse<Project> }>(`/workspaces/${workspaceId}/projects`, { params })
}

export function getProjectById(workspaceId: string, projectId: string) {
  return api.get<{ success: boolean; data: Project }>(`/workspaces/${workspaceId}/projects/${projectId}`)
}

export function createProject(workspaceId: string, input: CreateProjectInput) {
  return api.post<{ success: boolean; data: Project }>(`/workspaces/${workspaceId}/projects`, input)
}

export function updateProject(workspaceId: string, projectId: string, input: UpdateProjectInput) {
  return api.patch<{ success: boolean; data: Project }>(`/workspaces/${workspaceId}/projects/${projectId}`, input)
}

export function updateProjectStatus(workspaceId: string, projectId: string, input: UpdateProjectStatusInput) {
  return api.patch<{ success: boolean; data: Project }>(`/workspaces/${workspaceId}/projects/${projectId}/status`, input)
}

export function deleteProject(workspaceId: string, projectId: string, deleteReason?: string) {
  return api.delete<{ success: boolean; data: Project }>(`/workspaces/${workspaceId}/projects/${projectId}`, {
    data: { deleteReason },
  })
}

export function restoreProject(workspaceId: string, projectId: string) {
  return api.post<{ success: boolean; data: Project }>(`/workspaces/${workspaceId}/projects/${projectId}/restore`)
}
