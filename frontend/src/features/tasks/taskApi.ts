import apiClient from '../../lib/api-client'
import type { Task, Subtask, CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskListResponse } from './types'
import type { ApiResponse } from '../auth/authApi'

export const taskApi = {
  listByProject: (projectId: string, params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<TaskListResponse>>(`/projects/${projectId}/tasks`, { params }),

  listDeleted: (projectId: string) =>
    apiClient.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks/trash`),

  listMy: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<TaskListResponse>>('/tasks/my', { params }),

  get: (taskId: string) =>
    apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`),

  create: (featureId: string, data: CreateTaskInput) =>
    apiClient.post<ApiResponse<Task>>(`/features/${featureId}/tasks`, data),

  update: (taskId: string, data: UpdateTaskInput) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data),

  updateStatus: (taskId: string, data: UpdateTaskStatusInput) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, data),

  assign: (taskId: string, assigneeId: string | null) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/assign`, { assigneeId }),

  reorder: (taskId: string, order: number) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/reorder`, { order }),

  delete: (taskId: string, deleteReason?: string) =>
    apiClient.delete<ApiResponse<Task>>(`/tasks/${taskId}`, { data: { deleteReason } }),

  restore: (taskId: string) =>
    apiClient.post<ApiResponse<Task>>(`/tasks/${taskId}/restore`),

  bulkDelete: (taskIds: string[], deleteReason?: string) =>
    apiClient.post<ApiResponse<{ tasksDeleted: number }>>('/tasks/bulk-delete', { taskIds, deleteReason }),

  createSubtask: (taskId: string, title: string) =>
    apiClient.post<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks`, { title }),

  updateSubtask: (subtaskId: string, data: { title?: string; isDone?: boolean }) =>
    apiClient.patch<ApiResponse<Subtask>>(`/subtasks/${subtaskId}`, data),

  reorderSubtask: (subtaskId: string, order: number) =>
    apiClient.patch<ApiResponse<Subtask>>(`/subtasks/${subtaskId}/reorder`, { order }),

  deleteSubtask: (subtaskId: string) =>
    apiClient.delete<ApiResponse<{ subtaskId: string; deleted: boolean }>>(`/subtasks/${subtaskId}`),

  bulkDeleteSubtasks: (subtaskIds: string[]) =>
    apiClient.post<ApiResponse<{ subtasksDeleted: number }>>('/subtasks/bulk-delete', { subtaskIds }),
}
