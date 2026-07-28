export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: string) => [...workspaceKeys.all, id] as const,
  members: (id: string) => [...workspaceKeys.all, id, 'members'] as const,
}
