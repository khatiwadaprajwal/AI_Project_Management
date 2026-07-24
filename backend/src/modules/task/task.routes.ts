import { Router } from 'express';
import { protect, attachNestedWorkspaceId } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  resolveWorkspaceIdFromFeature,
  resolveWorkspaceIdFromTask,
} from '../../utils/resolveWorkspace';
import * as taskController from './task.controller';
import {
  createTaskSchema, updateTaskSchema, updateTaskStatusSchema, assignTaskSchema,
  reorderTaskSchema, deleteTaskSchema, bulkDeleteTasksSchema,
  createSubtaskSchema, updateSubtaskSchema, reorderSubtaskSchema, bulkDeleteSubtasksSchema,
  taskIdParamsSchema, subtaskIdParamsSchema, listTasksQuerySchema, listMyTasksQuerySchema,projectIdParamsSchema
} from './task.validation';

const router = Router();

router.use(protect);

router.post('/tasks/bulk-delete', validate(bulkDeleteTasksSchema), taskController.bulkDeleteTasks);
router.post('/subtasks/bulk-delete', validate(bulkDeleteSubtasksSchema), taskController.bulkDeleteSubtasks);

router.post(
  '/features/:featureId/tasks',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromFeature(req.params.featureId as string)
  ),
  validate(createTaskSchema),
  taskController.createTask
);

router.get('/tasks/mine', validate(listMyTasksQuerySchema), taskController.listMyTasks);

router.get('/projects/:projectId/tasks', validate(listTasksQuerySchema), taskController.listTasksByProject);

router.get('/tasks/:taskId', validate(taskIdParamsSchema), taskController.getTask);
router.get(
  '/projects/:projectId/tasks/trash',
  validate(projectIdParamsSchema),
  taskController.listDeletedTasks
);
router.patch(
  '/tasks/:taskId',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(updateTaskSchema),
  taskController.updateTask
);

router.patch('/tasks/:taskId/status', validate(updateTaskStatusSchema), taskController.updateTaskStatus);

router.patch(
  '/tasks/:taskId/assign',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(assignTaskSchema),
  taskController.assignTask
);

router.patch(
  '/tasks/:taskId/reorder',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(reorderTaskSchema),
  taskController.reorderTask
);

router.delete(
  '/tasks/:taskId',
  attachNestedWorkspaceId(async (req) =>
    resolveWorkspaceIdFromTask(req.params.taskId as string)
  ),
  validate(deleteTaskSchema),
  taskController.deleteTask
);

router.post('/tasks/:taskId/restore', validate(taskIdParamsSchema), taskController.restoreTask);

router.post('/tasks/:taskId/subtasks', validate(createSubtaskSchema), taskController.createSubtask);
router.patch('/subtasks/:subtaskId', validate(updateSubtaskSchema), taskController.updateSubtask);
router.patch('/subtasks/:subtaskId/reorder', validate(reorderSubtaskSchema), taskController.reorderSubtask);
router.delete('/subtasks/:subtaskId', validate(subtaskIdParamsSchema), taskController.deleteSubtask);

export const taskRoutes = router;