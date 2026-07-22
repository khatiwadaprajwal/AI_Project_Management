import { Router } from 'express';
import { protect, restrictWorkspaceRole } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import * as projectController from './project.controller';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  projectParamsSchema,
  listProjectsQuerySchema,
} from './project.validation';

const router = Router();

router.use(protect);

router.post(
  '/:workspaceId/projects',
  restrictWorkspaceRole('OWNER', 'ADMIN', 'LEAD'),
  validate(createProjectSchema),
  projectController.createProject
);

router.get(
  '/:workspaceId/projects',
  validate(listProjectsQuerySchema),
  projectController.listProjects
);

router.get(
  '/:workspaceId/projects/:projectId',
  validate(projectParamsSchema),
  projectController.getProject
);

router.patch(
  '/:workspaceId/projects/:projectId',
  restrictWorkspaceRole('OWNER', 'ADMIN', 'LEAD'),
  validate(updateProjectSchema),
  projectController.updateProject
);

router.patch(
  '/:workspaceId/projects/:projectId/status',
  restrictWorkspaceRole('OWNER', 'ADMIN', 'LEAD'),
  validate(updateProjectStatusSchema),
  projectController.updateProjectStatus
);

router.delete(
  '/:workspaceId/projects/:projectId',
  restrictWorkspaceRole('OWNER', 'ADMIN'),
  validate(projectParamsSchema),
  projectController.archiveProject
);

export const projectRoutes = router;