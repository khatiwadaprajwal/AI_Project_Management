import api from '@/lib/axios'
import type { Feature, CreateFeatureInput, UpdateFeatureInput, ReorderFeatureInput, PaginatedFeatures } from '@/types/feature'

export function listFeatures(projectId: string, params?: { page?: number; limit?: number }) {
  return api.get<{ success: boolean; data: PaginatedFeatures }>(`/projects/${projectId}/features`, { params })
}

export function createFeature(projectId: string, input: CreateFeatureInput) {
  return api.post<{ success: boolean; data: Feature }>(`/projects/${projectId}/features`, input)
}

export function updateFeature(featureId: string, input: UpdateFeatureInput) {
  return api.patch<{ success: boolean; data: Feature }>(`/features/${featureId}`, input)
}

export function reorderFeature(featureId: string, input: ReorderFeatureInput) {
  return api.patch<{ success: boolean; data: Feature }>(`/features/${featureId}/reorder`, input)
}

export function deleteFeature(featureId: string, deleteReason?: string) {
  return api.delete<{ success: boolean; data: Feature }>(`/features/${featureId}`, {
    data: { deleteReason },
  })
}

export function restoreFeature(featureId: string) {
  return api.post<{ success: boolean; data: Feature }>(`/features/${featureId}/restore`)
}
