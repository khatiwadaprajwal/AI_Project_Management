import { Router } from 'express';
import { protect, attachWorkspaceId } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as projectController from './project.controller';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  deleteProjectSchema,
  projectParamsSchema,
  listProjectsQuerySchema,
} from './project.validation';

const router = Router();

router.use(protect);

router.post(
  '/:workspaceId/projects',
  attachWorkspaceId,
  validate(createProjectSchema),
  projectController.createProject
);

router.get(
  '/:workspaceId/projects',
  attachWorkspaceId,
  validate(listProjectsQuerySchema),
  projectController.listProjects
);

router.get(
  '/:workspaceId/projects/:projectId',
  attachWorkspaceId,
  validate(projectParamsSchema),
  projectController.getProject
);

router.patch(
  '/:workspaceId/projects/:projectId',
  attachWorkspaceId,
  validate(updateProjectSchema),
  projectController.updateProject
);

router.patch(
  '/:workspaceId/projects/:projectId/status',
  attachWorkspaceId,
  validate(updateProjectStatusSchema),
  projectController.updateProjectStatus
);

router.delete(
  '/:workspaceId/projects/:projectId',
  attachWorkspaceId,
  validate(deleteProjectSchema),
  projectController.deleteProject
);

router.post(
  '/:workspaceId/projects/:projectId/restore',
  attachWorkspaceId,
  validate(projectParamsSchema),
  projectController.restoreProject
);

export const projectRoutes = router;