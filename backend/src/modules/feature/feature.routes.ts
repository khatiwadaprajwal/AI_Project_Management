import { Router } from 'express';
import { protect, attachNestedWorkspaceId } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  resolveWorkspaceIdFromProject,
  resolveWorkspaceIdFromFeature,
} from '../../utils/resolveWorkspace';
import * as featureController from './feature.controller';
import {
  createFeatureSchema,
  updateFeatureSchema,
  reorderFeatureSchema,
  deleteFeatureSchema,
  bulkDeleteFeaturesSchema,
  featureIdParamsSchema,
  listFeaturesQuerySchema,
} from './feature.validation';

const router = Router();

router.use(protect);

router.post(
  '/features/bulk-delete',
  validate(bulkDeleteFeaturesSchema),
  featureController.bulkDeleteFeatures
);

router.post(
  '/projects/:projectId/features',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromProject(req.params.projectId as string)
  ),
  validate(createFeatureSchema),
  featureController.createFeature
);

router.get(
  '/projects/:projectId/features',
  validate(listFeaturesQuerySchema),
  featureController.listFeatures
);

router.patch(
  '/features/:featureId',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(updateFeatureSchema),
  featureController.updateFeature
);

router.patch(
  '/features/:featureId/reorder',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(reorderFeatureSchema),
  featureController.reorderFeature
);

router.delete(
  '/features/:featureId',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(deleteFeatureSchema),
  featureController.deleteFeature
);

router.post(
  '/features/:featureId/restore',
  validate(featureIdParamsSchema),
  featureController.restoreFeature
);

export const featureRoutes = router;