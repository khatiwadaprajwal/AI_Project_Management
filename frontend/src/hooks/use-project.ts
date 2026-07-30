import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as projectApi from '@/lib/api/project'
import type { CreateProjectInput, UpdateProjectInput, UpdateProjectStatusInput } from '@/types/project'
import { useActiveWorkspace } from '@/hooks/use-workspace'

const projectKeys = {
  list: (workspaceId: string) => ['projects', workspaceId] as const,
  detail: (workspaceId: string, projectId: string) => ['projects', workspaceId, projectId] as const,
}

function useResolvedWorkspaceId() {
  const { workspace } = useActiveWorkspace()
  return workspace?.id
}

export function useProjects(params?: { status?: string; page?: number; limit?: number }) {
  const workspaceId = useResolvedWorkspaceId()

  return useQuery({
    queryKey: [...projectKeys.list(workspaceId ?? ''), params],
    queryFn: async () => {
      const res = await projectApi.listProjects(workspaceId!, params)
      return res.data.data
    },
    enabled: !!workspaceId,
  })
}

export function useProject(projectId: string | undefined) {
  const workspaceId = useResolvedWorkspaceId()

  return useQuery({
    queryKey: projectKeys.detail(workspaceId ?? '', projectId!),
    queryFn: async () => {
      const res = await projectApi.getProjectById(workspaceId!, projectId!)
      return res.data.data
    },
    enabled: !!workspaceId && !!projectId,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const workspaceId = useResolvedWorkspaceId()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectApi.createProject(workspaceId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId!) })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  const workspaceId = useResolvedWorkspaceId()

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) =>
      projectApi.updateProject(workspaceId!, projectId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId!) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(workspaceId!, variables.projectId) })
    },
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()
  const workspaceId = useResolvedWorkspaceId()

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectStatusInput }) =>
      projectApi.updateProjectStatus(workspaceId!, projectId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId!) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(workspaceId!, variables.projectId) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const workspaceId = useResolvedWorkspaceId()

  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(workspaceId!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId!) })
    },
  })
}

export function useRestoreProject() {
  const queryClient = useQueryClient()
  const workspaceId = useResolvedWorkspaceId()

  return useMutation({
    mutationFn: (projectId: string) => projectApi.restoreProject(workspaceId!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId!) })
    },
  })
}
