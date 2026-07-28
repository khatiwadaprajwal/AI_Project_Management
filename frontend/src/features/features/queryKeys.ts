export const featureKeys = {
  all: (projectId: string) => ['projects', projectId, 'features'] as const,
  lists: (projectId: string) => [...featureKeys.all(projectId), 'list'] as const,
  list: (projectId: string, params?: Record<string, unknown>) =>
    [...featureKeys.lists(projectId), params] as const,
  trash: (projectId: string) => [...featureKeys.all(projectId), 'trash'] as const,
}
