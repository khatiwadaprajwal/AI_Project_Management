import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as featureApi from '@/lib/api/feature'
import type { CreateFeatureInput, UpdateFeatureInput, ReorderFeatureInput } from '@/types/feature'

const featureKeys = {
  list: (projectId: string) => ['features', projectId] as const,
}

export function useFeatures(projectId: string | undefined) {
  return useQuery({
    queryKey: featureKeys.list(projectId!),
    queryFn: async () => {
      const res = await featureApi.listFeatures(projectId!)
      return res.data.data
    },
    enabled: !!projectId,
  })
}

export function useCreateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: CreateFeatureInput }) =>
      featureApi.createFeature(projectId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: featureKeys.list(variables.projectId) })
    },
  })
}

export function useUpdateFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ featureId, input }: { featureId: string; input: UpdateFeatureInput }) =>
      featureApi.updateFeature(featureId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })
}

export function useReorderFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ featureId, input }: { featureId: string; input: ReorderFeatureInput }) =>
      featureApi.reorderFeature(featureId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })
}

export function useDeleteFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ featureId }: { featureId: string; projectId: string }) =>
      featureApi.deleteFeature(featureId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: featureKeys.list(variables.projectId) })
    },
  })
}
