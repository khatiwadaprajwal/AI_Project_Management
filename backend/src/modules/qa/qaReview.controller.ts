import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { qaReviewService } from './qaReview.service';

export const createQaReview = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await qaReviewService.create(taskId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 201, success: true, message: 'QA review submitted.', data: result });
});

export const listQaReviews = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await qaReviewService.listByTask(taskId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'QA reviews retrieved.', data: result });
});
