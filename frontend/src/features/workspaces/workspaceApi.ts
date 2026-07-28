import apiClient from '../../lib/api-client'
import type { Workspace, Member, CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput, UpdateMemberRoleInput } from './types'
import type { ApiResponse } from '../auth/authApi'

export const workspaceApi = {
  create: (data: CreateWorkspaceInput) =>
    apiClient.post<ApiResponse<Workspace>>('/workspaces', data),

  get: (workspaceId: string) =>
    apiClient.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`),

  update: (workspaceId: string, data: UpdateWorkspaceInput) =>
    apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, data),

  delete: (workspaceId: string) =>
    apiClient.delete<ApiResponse<{ workspaceId: string; deleted: boolean }>>(`/workspaces/${workspaceId}`),

  listMembers: (workspaceId: string) =>
    apiClient.get<ApiResponse<Member[]>>(`/workspaces/${workspaceId}/members`),

  updateMemberRole: (workspaceId: string, userId: string, data: UpdateMemberRoleInput) =>
    apiClient.patch<ApiResponse<{ userId: string; workspaceId: string; role: string }>>(`/workspaces/${workspaceId}/members/${userId}`, data),

  removeMember: (workspaceId: string, userId: string) =>
    apiClient.delete<ApiResponse<{ userId: string; workspaceId: string; removed: boolean }>>(`/workspaces/${workspaceId}/members/${userId}`),

  inviteMember: (workspaceId: string, data: InviteMemberInput) =>
    apiClient.post<ApiResponse<any>>(`/workspaces/${workspaceId}/invites`, data),

  transferOwnership: (workspaceId: string, newOwnerUserId: string) =>
    apiClient.post<ApiResponse<{ workspaceId: string; newOwnerUserId: string }>>(`/workspaces/${workspaceId}/transfer-ownership`, { newOwnerUserId }),
}
