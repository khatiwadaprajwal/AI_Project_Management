import api from '@/lib/axios'
import type {
  Task, Subtask, AiSuggestion,
  CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, AssignTaskInput, ReorderInput,
  CreateSubtaskInput, UpdateSubtaskInput,
  PaginatedTasks, AcceptRejectResponse,
} from '@/types/task'

// ─── Tasks ───

export function listTasksByProject(projectId: string, params?: { status?: string; assigneeId?: string; priority?: string; featureId?: string; page?: number; limit?: number }) {
  return api.get<{ success: boolean; data: PaginatedTasks }>(`/projects/${projectId}/tasks`, { params })
}

export function getTask(taskId: string) {
  return api.get<{ success: boolean; data: Task }>(`/tasks/${taskId}`)
}

export function createTask(featureId: string, input: CreateTaskInput) {
  return api.post<{ success: boolean; data: Task }>(`/features/${featureId}/tasks`, input)
}

export function updateTask(taskId: string, input: UpdateTaskInput) {
  return api.patch<{ success: boolean; data: Task }>(`/tasks/${taskId}`, input)
}

export function updateTaskStatus(taskId: string, input: UpdateTaskStatusInput) {
  return api.patch<{ success: boolean; data: Task }>(`/tasks/${taskId}/status`, input)
}

export function assignTask(taskId: string, input: AssignTaskInput) {
  return api.patch<{ success: boolean; data: Task }>(`/tasks/${taskId}/assign`, input)
}

export function reorderTask(taskId: string, input: ReorderInput) {
  return api.patch<{ success: boolean; data: Task }>(`/tasks/${taskId}/reorder`, input)
}

export function deleteTask(taskId: string, deleteReason?: string) {
  return api.delete<{ success: boolean; data: Task }>(`/tasks/${taskId}`, { data: { deleteReason } })
}

export function restoreTask(taskId: string) {
  return api.post<{ success: boolean; data: Task }>(`/tasks/${taskId}/restore`)
}

// ─── Subtasks ───

export function createSubtask(taskId: string, input: CreateSubtaskInput) {
  return api.post<{ success: boolean; data: Subtask }>(`/tasks/${taskId}/subtasks`, input)
}

export function updateSubtask(subtaskId: string, input: UpdateSubtaskInput) {
  return api.patch<{ success: boolean; data: Subtask }>(`/subtasks/${subtaskId}`, input)
}

export function reorderSubtask(subtaskId: string, input: ReorderInput) {
  return api.patch<{ success: boolean; data: Subtask }>(`/subtasks/${subtaskId}/reorder`, input)
}

export function deleteSubtask(subtaskId: string) {
  return api.delete<{ success: boolean; data: { subtaskId: string; deleted: boolean } }>(`/subtasks/${subtaskId}`)
}

// ─── AI Suggestions ───

export function listTaskSuggestions(featureId: string) {
  return api.get<{ success: boolean; data: AiSuggestion[] }>(`/features/${featureId}/task-suggestions`)
}

export function listSubtaskSuggestions(taskId: string) {
  return api.get<{ success: boolean; data: AiSuggestion[] }>(`/tasks/${taskId}/subtask-suggestions`)
}

export function generateTaskSuggestions(featureId: string) {
  return api.post<{ success: boolean; data: AiSuggestion[] }>(`/features/${featureId}/task-suggestions/generate`)
}

export function generateSubtaskSuggestions(taskId: string) {
  return api.post<{ success: boolean; data: AiSuggestion[] }>(`/tasks/${taskId}/subtask-suggestions/generate`)
}

export function acceptTaskSuggestion(featureId: string, suggestionId: string) {
  return api.post<{ success: boolean; data: AcceptRejectResponse }>(`/features/${featureId}/task-suggestions/${suggestionId}/accept`)
}

export function rejectTaskSuggestion(featureId: string, suggestionId: string) {
  return api.post<{ success: boolean; data: { nextSuggestion: AiSuggestion | null } }>(`/features/${featureId}/task-suggestions/${suggestionId}/reject`)
}

export function acceptSubtaskSuggestion(taskId: string, suggestionId: string) {
  return api.post<{ success: boolean; data: AcceptRejectResponse }>(`/tasks/${taskId}/subtask-suggestions/${suggestionId}/accept`)
}

export function rejectSubtaskSuggestion(taskId: string, suggestionId: string) {
  return api.post<{ success: boolean; data: { nextSuggestion: AiSuggestion | null } }>(`/tasks/${taskId}/subtask-suggestions/${suggestionId}/reject`)
}
