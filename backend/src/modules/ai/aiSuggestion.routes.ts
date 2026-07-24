import { Router } from 'express';
import { protect, attachNestedWorkspaceId } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  resolveWorkspaceIdFromFeature,
  resolveWorkspaceIdFromTask,
} from '../../utils/resolveWorkspace';
import { featureIdParamsSchema, taskIdParamsSchema, suggestionIdParamsSchema } from './aiSuggestion.validation';
import * as aiSuggestionController from './aiSuggestion.controller';

const router = Router();

router.use(protect);

// ── Task suggestions for a feature ──
router.get(
  '/features/:featureId/task-suggestions',
  validate(featureIdParamsSchema),
  aiSuggestionController.listTaskSuggestions,
);

router.post(
  '/features/:featureId/task-suggestions/generate',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(featureIdParamsSchema),
  aiSuggestionController.generateTaskSuggestions,
);

router.post(
  '/features/:featureId/task-suggestions/:suggestionId/accept',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  aiSuggestionController.acceptTaskSuggestion,
);

router.post(
  '/features/:featureId/task-suggestions/:suggestionId/reject',
  aiSuggestionController.rejectTaskSuggestion,
);

// ── Subtask suggestions for a task ──
router.get(
  '/tasks/:taskId/subtask-suggestions',
  validate(taskIdParamsSchema),
  aiSuggestionController.listSubtaskSuggestions,
);

router.post(
  '/tasks/:taskId/subtask-suggestions/generate',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(taskIdParamsSchema),
  aiSuggestionController.generateSubtaskSuggestions,
);

router.post(
  '/tasks/:taskId/subtask-suggestions/:suggestionId/accept',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  aiSuggestionController.acceptSubtaskSuggestion,
);

router.post(
  '/tasks/:taskId/subtask-suggestions/:suggestionId/reject',
  aiSuggestionController.rejectSubtaskSuggestion,
);

export const aiSuggestionRoutes = router;
