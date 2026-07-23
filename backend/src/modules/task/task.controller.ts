import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { taskService } from './task.service';

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  const result = await taskService.createTask(featureId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 201, success: true, message: 'Task created successfully.', data: result });
});

export const listMyTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await taskService.listMyTasks(req.user!.id, req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Your tasks retrieved successfully.', data: result });
});

export const listTasksByProject = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const result = await taskService.listTasksByProject(projectId, req.user!.id, req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tasks retrieved successfully.', data: result });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.getTaskById(taskId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task retrieved successfully.', data: result });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.updateTask(taskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task updated successfully.', data: result });
});

export const updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.updateTaskStatus(taskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task status updated successfully.', data: result });
});

export const assignTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.assignTask(taskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task assigned successfully.', data: result });
});

export const reorderTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.reorderTask(taskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task reordered successfully.', data: result });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.deleteTask(taskId, req.body?.deleteReason, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task deleted successfully.', data: result });
});

export const restoreTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.restoreTask(taskId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task restored successfully.', data: result });
});

export const bulkDeleteTasks = catchAsync(async (req: Request, res: Response) => {
  const { taskIds, deleteReason } = req.body;
  const result = await taskService.bulkDeleteTasks(taskIds, deleteReason, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tasks deleted successfully.', data: result });
});

export const createSubtask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await taskService.createSubtask(taskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 201, success: true, message: 'Subtask created successfully.', data: result });
});

export const updateSubtask = catchAsync(async (req: Request, res: Response) => {
  const subtaskId = req.params.subtaskId as string;
  const result = await taskService.updateSubtask(subtaskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask updated successfully.', data: result });
});

export const reorderSubtask = catchAsync(async (req: Request, res: Response) => {
  const subtaskId = req.params.subtaskId as string;
  const result = await taskService.reorderSubtask(subtaskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask reordered successfully.', data: result });
});

export const deleteSubtask = catchAsync(async (req: Request, res: Response) => {
  const subtaskId = req.params.subtaskId as string;
  const result = await taskService.deleteSubtask(subtaskId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask deleted successfully.', data: result });
});

export const bulkDeleteSubtasks = catchAsync(async (req: Request, res: Response) => {
  const { subtaskIds } = req.body;
  const result = await taskService.bulkDeleteSubtasks(subtaskIds, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtasks deleted successfully.', data: result });
});