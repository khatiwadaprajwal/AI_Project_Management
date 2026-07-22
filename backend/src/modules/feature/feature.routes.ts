import { Router } from 'express';
import { protect, restrictNestedWorkspaceRole } from '../auth/auth.middleware';
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
  featureIdParamsSchema,
  listFeaturesQuerySchema,
} from './feature.validation';

const router = Router();

router.use(protect);

router.post(
  '/projects/:projectId/features',
  restrictNestedWorkspaceRole(['OWNER', 'ADMIN', 'LEAD'], async (req) =>
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
  restrictNestedWorkspaceRole(['OWNER', 'ADMIN', 'LEAD'], async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(updateFeatureSchema),
  featureController.updateFeature
);

router.patch(
  '/features/:featureId/reorder',
  restrictNestedWorkspaceRole(['OWNER', 'ADMIN', 'LEAD'], async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(reorderFeatureSchema),
  featureController.reorderFeature
);

router.delete(
  '/features/:featureId',
  restrictNestedWorkspaceRole(['OWNER', 'ADMIN'], async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(featureIdParamsSchema),
  featureController.deleteFeature
);

export const featureRoutes = router;