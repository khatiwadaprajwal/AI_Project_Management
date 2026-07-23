import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { featureService } from './feature.service';

export const createFeature = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const result = await featureService.createFeature(projectId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 201, success: true, message: 'Feature created successfully.', data: result });
});

export const listFeatures = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const result = await featureService.listFeatures(projectId, req.user!.id, req.query as any);
  sendResponse(res, { statusCode: 200, success: true, message: 'Features retrieved successfully.', data: result });
});

export const updateFeature = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  const result = await featureService.updateFeature(featureId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feature updated successfully.', data: result });
});

export const reorderFeature = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  const result = await featureService.reorderFeature(featureId, req.body, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feature reordered successfully.', data: result });
});

export const deleteFeature = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  const result = await featureService.deleteFeature(featureId, req.body?.deleteReason, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feature deleted successfully.', data: result });
});

export const restoreFeature = catchAsync(async (req: Request, res: Response) => {
  const featureId = req.params.featureId as string;
  const result = await featureService.restoreFeature(featureId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feature restored successfully.', data: result });
});

export const bulkDeleteFeatures = catchAsync(async (req: Request, res: Response) => {
  const { featureIds, deleteReason } = req.body;
  const result = await featureService.bulkDeleteFeatures(featureIds, deleteReason, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Features deleted successfully.', data: result });
});