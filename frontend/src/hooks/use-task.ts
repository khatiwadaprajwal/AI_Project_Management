import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskApi from '@/lib/api/task'
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, AssignTaskInput, ReorderInput, CreateSubtaskInput, UpdateSubtaskInput } from '@/types/task'

const taskKeys = {
  byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
  byFeature: (featureId: string) => ['tasks', 'feature', featureId] as const,
  detail: (taskId: string) => ['tasks', taskId] as const,
  subtasks: (taskId: string) => ['tasks', taskId, 'subtasks'] as const,
}

export function useTasksByProject(projectId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId!),
    queryFn: async () => {
      const res = await taskApi.listTasksByProject(projectId!)
      return res.data.data
    },
    enabled: !!projectId,
  })
}

export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(taskId!),
    queryFn: async () => {
      const res = await taskApi.getTask(taskId!)
      return res.data.data
    },
    enabled: !!taskId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ featureId, input }: { featureId: string; input: CreateTaskInput }) =>
      taskApi.createTask(featureId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      taskApi.updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskStatusInput }) =>
      taskApi.updateTaskStatus(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: AssignTaskInput }) =>
      taskApi.assignTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useReorderTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: ReorderInput }) =>
      taskApi.reorderTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, deleteReason }: { taskId: string; deleteReason?: string }) =>
      taskApi.deleteTask(taskId, deleteReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ─── Subtasks ───

export function useCreateSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: CreateSubtaskInput }) =>
      taskApi.createSubtask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subtaskId, input }: { subtaskId: string; input: UpdateSubtaskInput }) =>
      taskApi.updateSubtask(subtaskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useReorderSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subtaskId, input }: { subtaskId: string; input: ReorderInput }) =>
      taskApi.reorderSubtask(subtaskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subtaskId: string) => taskApi.deleteSubtask(subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
