import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as workspaceApi from '@/lib/api/workspace'
import type { CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput } from '@/types/workspace'
import { useWorkspaceStore } from '@/store/workspace-store'

const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: string) => ['workspaces', id] as const,
  members: (id: string) => ['workspaces', id, 'members'] as const,
}

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: async () => {
      const res = await workspaceApi.listWorkspaces()
      return res.data.data
    },
  })
}

export function useActiveWorkspace() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const { data: workspaces } = useWorkspaces()

  const workspace = workspaces?.find((w) => w.id === activeWorkspaceId) ?? workspaces?.[0] ?? null

  return {
    workspace,
    workspaces,
    activeWorkspaceId: workspace?.id ?? null,
    isLoading: !workspaces,
  }
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId!),
    queryFn: async () => {
      const res = await workspaceApi.listMembers(workspaceId!)
      return res.data.data
    },
    enabled: !!workspaceId,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => workspaceApi.createWorkspace(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkspaceInput }) =>
      workspaceApi.updateWorkspace(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(variables.id) })
    },
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, input }: { workspaceId: string; input: InviteMemberInput }) =>
      workspaceApi.inviteMember(workspaceId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(variables.workspaceId) })
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceApi.removeMember(workspaceId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(variables.workspaceId) })
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workspaceApi.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}
