import { Router } from 'express';
import { protect, attachNestedWorkspaceId } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { resolveWorkspaceIdFromTask } from '../../utils/resolveWorkspace';
import { createQaReviewSchema, taskIdParamsSchema } from './qaReview.validation';
import * as qaReviewController from './qaReview.controller';

const router = Router();

router.use(protect);

router.post(
  '/tasks/:taskId/qa-reviews',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(createQaReviewSchema),
  qaReviewController.createQaReview,
);

router.get(
  '/tasks/:taskId/qa-reviews',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(taskIdParamsSchema),
  qaReviewController.listQaReviews,
);

export const qaReviewRoutes = router;
