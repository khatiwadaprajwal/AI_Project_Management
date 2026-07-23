import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { projectService } from './project.service';

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await projectService.createProject(workspaceId, req.body, req.user!.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Project created successfully.',
    data: result,
  });
});

export const listProjects = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await projectService.listProjects(workspaceId, req.user!.id, req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Projects retrieved successfully.',
    data: result,
  });
});

export const getProject = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, projectId } = req.params as { workspaceId: string; projectId: string };
  const result = await projectService.getProjectById(workspaceId, projectId, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Project retrieved successfully.',
    data: result,
  });
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, projectId } = req.params as { workspaceId: string; projectId: string };
  const result = await projectService.updateProject(workspaceId, projectId, req.body, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Project updated successfully.',
    data: result,
  });
});

export const updateProjectStatus = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, projectId } = req.params as { workspaceId: string; projectId: string };
  const result = await projectService.updateProjectStatus(
    workspaceId,
    projectId,
    req.body,
    req.user!.id
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Project status updated successfully.',
    data: result,
  });
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, projectId } = req.params as { workspaceId: string; projectId: string };
  const result = await projectService.deleteProject(workspaceId, projectId, req.body?.deleteReason, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Project deleted successfully.', data: result });
});

export const restoreProject = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, projectId } = req.params as { workspaceId: string; projectId: string };
  const result = await projectService.restoreProject(workspaceId, projectId, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Project restored successfully.', data: result });
});