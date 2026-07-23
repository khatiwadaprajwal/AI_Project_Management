import { z } from 'zod';
import { paginationQuerySchema } from '../../utils/pagination/pagination.schema';

export const projectIdParamsSchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
});

export const featureIdParamsSchema = z.object({
  params: z.object({ featureId: z.string().min(1) }),
});

export const createFeatureSchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1, 'Feature name is required'),
  }),
});

export const updateFeatureSchema = z.object({
  params: z.object({ featureId: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});

export const reorderFeatureSchema = z.object({
  params: z.object({ featureId: z.string().min(1) }),
  body: z.object({
    order: z.number().int().min(0),
  }),
});

export const deleteFeatureSchema = z.object({
  params: z.object({ featureId: z.string().min(1) }),
  body: z.object({
    deleteReason: z.string().optional(),
  }),
});

export const bulkDeleteFeaturesSchema = z.object({
  body: z.object({
    featureIds: z.array(z.string().min(1)).min(1),
    deleteReason: z.string().optional(),
  }),
});

export const listFeaturesQuerySchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
  query: paginationQuerySchema,
});