import { z } from 'zod';
import { createFeatureSchema, updateFeatureSchema, reorderFeatureSchema } from './feature.validation';

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>['body'];
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>['body'];
export type ReorderFeatureInput = z.infer<typeof reorderFeatureSchema>['body'];