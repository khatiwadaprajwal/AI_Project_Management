import { z } from 'zod';
import {
  createFeatureSchema,
  updateFeatureSchema,
  reorderFeatureSchema,
  deleteFeatureSchema,
  bulkDeleteFeaturesSchema,
} from './feature.validation';

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>['body'];
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>['body'];
export type ReorderFeatureInput = z.infer<typeof reorderFeatureSchema>['body'];
export type DeleteFeatureInput = z.infer<typeof deleteFeatureSchema>['body'];
export type BulkDeleteFeaturesInput = z.infer<typeof bulkDeleteFeaturesSchema>['body'];