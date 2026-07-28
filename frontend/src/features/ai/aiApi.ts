import apiClient from '../../lib/api-client'
import type { AiSuggestion } from './types'
import type { ApiResponse } from '../auth/authApi'

export const aiApi = {
  listTaskSuggestions: (featureId: string) =>
    apiClient.get<ApiResponse<AiSuggestion[]>>(`/features/${featureId}/task-suggestions`),

  generateTaskSuggestions: (featureId: string) =>
    apiClient.post<ApiResponse<AiSuggestion[]>>(`/features/${featureId}/task-suggestions/generate`),

  acceptTaskSuggestion: (suggestionId: string) =>
    apiClient.post<ApiResponse<any>>(`/features/task-suggestions/${suggestionId}/accept`),

  rejectTaskSuggestion: (suggestionId: string) =>
    apiClient.post<ApiResponse<any>>(`/features/task-suggestions/${suggestionId}/reject`),

  listSubtaskSuggestions: (taskId: string) =>
    apiClient.get<ApiResponse<AiSuggestion[]>>(`/tasks/${taskId}/subtask-suggestions`),

  generateSubtaskSuggestions: (taskId: string) =>
    apiClient.post<ApiResponse<AiSuggestion[]>>(`/tasks/${taskId}/subtask-suggestions/generate`),

  acceptSubtaskSuggestion: (suggestionId: string) =>
    apiClient.post<ApiResponse<any>>(`/tasks/subtask-suggestions/${suggestionId}/accept`),

  rejectSubtaskSuggestion: (suggestionId: string) =>
    apiClient.post<ApiResponse<any>>(`/tasks/subtask-suggestions/${suggestionId}/reject`),
}
