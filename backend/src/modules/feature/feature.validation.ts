import { z } from 'zod';
import { paginationQuerySchema } from '../../utils/pagination/pagination.schema';

export const projectIdParamsSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
});

export const featureIdParamsSchema = z.object({
  params: z.object({
    featureId: z.string().min(1),
  }),
});

export const createFeatureSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1, 'Feature name is required'),
    order: z.number().int().min(0).optional(),
  }),
});

export const updateFeatureSchema = z.object({
  params: z.object({
    featureId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});

export const reorderFeatureSchema = z.object({
  params: z.object({
    featureId: z.string().min(1),
  }),
  body: z.object({
    order: z.number().int().min(0),
  }),
});

export const listFeaturesQuerySchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  query: paginationQuerySchema,
});