import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceApi } from './workspaceApi'
import { workspaceKeys } from './queryKeys'
import { useAuthStore } from '../../stores/auth-store'
import type { InviteMemberInput } from './types'

function getApiError(err: unknown): string {
  return (err as any)?.response?.data?.message ?? 'Something went wrong'
}

export function useWorkspaceMembers() {
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId)
  return useQuery({
    queryKey: workspaceKeys.members(activeWorkspaceId ?? ''),
    queryFn: () => workspaceApi.listMembers(activeWorkspaceId!).then((r) => r.data.data!),
    enabled: !!activeWorkspaceId,
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId)
  return useMutation({
    mutationFn: (data: InviteMemberInput) =>
      workspaceApi.inviteMember(activeWorkspaceId!, data),
    onSuccess: () => {
      toast.success('Member invited successfully')
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(activeWorkspaceId!) })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId)
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      workspaceApi.updateMemberRole(activeWorkspaceId!, userId, { role }),
    onSuccess: () => {
      toast.success('Role updated')
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(activeWorkspaceId!) })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId)
  return useMutation({
    mutationFn: (userId: string) =>
      workspaceApi.removeMember(activeWorkspaceId!, userId),
    onSuccess: () => {
      toast.success('Member removed')
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(activeWorkspaceId!) })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
