import apiClient from '../../lib/api-client'
import type { Feature, CreateFeatureInput, UpdateFeatureInput, FeatureListResponse } from './types'
import type { ApiResponse } from '../auth/authApi'

export const featureApi = {
  list: (projectId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<FeatureListResponse>>(`/projects/${projectId}/features`, { params }),

  listDeleted: (projectId: string) =>
    apiClient.get<ApiResponse<Feature[]>>(`/projects/${projectId}/features/trash`),

  create: (projectId: string, data: CreateFeatureInput) =>
    apiClient.post<ApiResponse<Feature>>(`/projects/${projectId}/features`, data),

  update: (featureId: string, data: UpdateFeatureInput) =>
    apiClient.patch<ApiResponse<Feature>>(`/features/${featureId}`, data),

  reorder: (featureId: string, order: number) =>
    apiClient.patch<ApiResponse<Feature>>(`/features/${featureId}/reorder`, { order }),

  delete: (featureId: string, deleteReason?: string) =>
    apiClient.delete<ApiResponse<{ feature: Feature; tasksAffected: number }>>(`/features/${featureId}`, { data: { deleteReason } }),

  restore: (featureId: string) =>
    apiClient.post<ApiResponse<{ feature: Feature; tasksRestored: number }>>(`/features/${featureId}/restore`),

  bulkDelete: (featureIds: string[], deleteReason?: string) =>
    apiClient.post<ApiResponse<{ featuresDeleted: number; tasksAffected: number }>>('/features/bulk-delete', { featureIds, deleteReason }),
}
