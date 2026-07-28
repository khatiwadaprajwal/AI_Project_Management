export const aiKeys = {
  taskSuggestions: (featureId: string) => ['ai', 'task-suggestions', featureId] as const,
  subtaskSuggestions: (taskId: string) => ['ai', 'subtask-suggestions', taskId] as const,
}
