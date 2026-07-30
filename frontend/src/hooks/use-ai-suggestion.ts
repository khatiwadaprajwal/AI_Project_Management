import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskApi from '@/lib/api/task'

const suggestionKeys = {
  taskSuggestions: (featureId: string) => ['suggestions', 'task', featureId] as const,
  subtaskSuggestions: (taskId: string) => ['suggestions', 'subtask', taskId] as const,
}

// ─── Task Suggestions ───

export function useTaskSuggestions(featureId: string | undefined) {
  return useQuery({
    queryKey: suggestionKeys.taskSuggestions(featureId!),
    queryFn: async () => {
      const res = await taskApi.listTaskSuggestions(featureId!)
      return res.data.data
    },
    enabled: !!featureId,
  })
}

export function useGenerateTaskSuggestions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (featureId: string) => taskApi.generateTaskSuggestions(featureId),
    onSuccess: (_data, featureId) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.taskSuggestions(featureId) })
    },
  })
}

export function useAcceptTaskSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ featureId, suggestionId }: { featureId: string; suggestionId: string }) =>
      taskApi.acceptTaskSuggestion(featureId, suggestionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.taskSuggestions(variables.featureId) })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useRejectTaskSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ featureId, suggestionId }: { featureId: string; suggestionId: string }) =>
      taskApi.rejectTaskSuggestion(featureId, suggestionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.taskSuggestions(variables.featureId) })
    },
  })
}

// ─── Subtask Suggestions ───

export function useSubtaskSuggestions(taskId: string | undefined) {
  return useQuery({
    queryKey: suggestionKeys.subtaskSuggestions(taskId!),
    queryFn: async () => {
      const res = await taskApi.listSubtaskSuggestions(taskId!)
      return res.data.data
    },
    enabled: !!taskId,
  })
}

export function useGenerateSubtaskSuggestions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => taskApi.generateSubtaskSuggestions(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.subtaskSuggestions(taskId) })
    },
  })
}

export function useAcceptSubtaskSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, suggestionId }: { taskId: string; suggestionId: string }) =>
      taskApi.acceptSubtaskSuggestion(taskId, suggestionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.subtaskSuggestions(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useRejectSubtaskSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, suggestionId }: { taskId: string; suggestionId: string }) =>
      taskApi.rejectSubtaskSuggestion(taskId, suggestionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.subtaskSuggestions(variables.taskId) })
    },
  })
}
