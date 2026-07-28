export const projectKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'projects'] as const,
  lists: (workspaceId: string) => [...projectKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, filters?: Record<string, unknown>) =>
    [...projectKeys.lists(workspaceId), filters] as const,
  details: (workspaceId: string) => [...projectKeys.all(workspaceId), 'detail'] as const,
  detail: (workspaceId: string, id: string) => [...projectKeys.details(workspaceId), id] as const,
}
