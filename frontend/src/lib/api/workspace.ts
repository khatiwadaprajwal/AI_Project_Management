import api from '@/lib/axios'
import type { Workspace, WorkspaceMember, CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput } from '@/types/workspace'

export function listWorkspaces() {
  return api.get<{ success: boolean; data: Workspace[] }>('/workspaces')
}

export function getWorkspaceById(id: string) {
  return api.get<{ success: boolean; data: Workspace }>(`/workspaces/${id}`)
}

export function createWorkspace(input: CreateWorkspaceInput) {
  return api.post<{ success: boolean; data: Workspace }>('/workspaces', input)
}

export function updateWorkspace(id: string, input: UpdateWorkspaceInput) {
  return api.patch<{ success: boolean; data: Workspace }>(`/workspaces/${id}`, input)
}

export function deleteWorkspace(id: string) {
  return api.delete<{ success: boolean; data: { workspaceId: string; deleted: boolean } }>(`/workspaces/${id}`)
}

export function listMembers(workspaceId: string) {
  return api.get<{ success: boolean; data: WorkspaceMember[] }>(`/workspaces/${workspaceId}/members`)
}

export function inviteMember(workspaceId: string, input: InviteMemberInput) {
  return api.post<{ success: boolean; data: { userId: string; workspaceId: string; role: string; isNewUser: boolean } }>(`/workspaces/${workspaceId}/invites`, input)
}

export function removeMember(workspaceId: string, userId: string) {
  return api.delete<{ success: boolean; data: { userId: string; workspaceId: string; removed: boolean } }>(`/workspaces/${workspaceId}/members/${userId}`)
}

export function transferOwnership(workspaceId: string, newOwnerUserId: string) {
  return api.post<{ success: boolean; data: { workspaceId: string; newOwnerUserId: string } }>(`/workspaces/${workspaceId}/transfer-ownership`, { newOwnerUserId })
}
