import apiClient from '../../lib/api-client'
import type { QaReview, CreateQaReviewInput } from './types'
import type { ApiResponse } from '../auth/authApi'

export const qaApi = {
  listByTask: (taskId: string) =>
    apiClient.get<ApiResponse<QaReview[]>>(`/tasks/${taskId}/qa-reviews`),

  create: (taskId: string, data: CreateQaReviewInput) =>
    apiClient.post<ApiResponse<QaReview>>(`/tasks/${taskId}/qa-reviews`, data),
}
