import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { aiSuggestionService } from './aiSuggestion.service';

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 30_000;

function checkCooldown(key: string): boolean {
  const last = cooldowns.get(key);
  const now = Date.now();
  if (last && now - last < COOLDOWN_MS) return false;
  cooldowns.set(key, now);
  return true;
}

export const listTaskSuggestions = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  const result = await aiSuggestionService.listPending('FEATURE', featureId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task suggestions retrieved.', data: result });
});

export const listSubtaskSuggestions = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await aiSuggestionService.listPending('TASK', taskId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask suggestions retrieved.', data: result });
});

export const generateTaskSuggestions = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  if (!checkCooldown(`feature:${featureId}`)) {
    return sendResponse(res, { statusCode: 429, success: false, message: 'Please wait before generating again (30s cooldown).' });
  }
  const result = await aiSuggestionService.generateForFeature(featureId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task suggestions generated.', data: result });
});

export const generateSubtaskSuggestions = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if (!checkCooldown(`task:${taskId}`)) {
    return sendResponse(res, { statusCode: 429, success: false, message: 'Please wait before generating again (30s cooldown).' });
  }
  const result = await aiSuggestionService.generateForTask(taskId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask suggestions generated.', data: result });
});

export const acceptTaskSuggestion = catchAsync(async (req: Request, res: Response) => {
  const suggestionId = req.params.suggestionId as string;
  const result = await aiSuggestionService.accept(suggestionId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task suggestion accepted.', data: result });
});

export const acceptSubtaskSuggestion = catchAsync(async (req: Request, res: Response) => {
  const suggestionId = req.params.suggestionId as string;
  const result = await aiSuggestionService.accept(suggestionId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask suggestion accepted.', data: result });
});

export const rejectTaskSuggestion = catchAsync(async (req: Request, res: Response) => {
  const suggestionId = req.params.suggestionId as string;
  const result = await aiSuggestionService.reject(suggestionId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Task suggestion rejected.', data: result });
});

export const rejectSubtaskSuggestion = catchAsync(async (req: Request, res: Response) => {
  const suggestionId = req.params.suggestionId as string;
  const result = await aiSuggestionService.reject(suggestionId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Subtask suggestion rejected.', data: result });
});
