export const taskKeys = {
  all: ['tasks'] as const,
  project: (projectId: string) => [...taskKeys.all, 'project', projectId] as const,
  projectList: (projectId: string, filters?: Record<string, unknown>) =>
    [...taskKeys.project(projectId), filters] as const,
  my: (params?: Record<string, unknown>) => [...taskKeys.all, 'my', params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  trash: (projectId: string) => [...taskKeys.all, 'trash', projectId] as const,
}
