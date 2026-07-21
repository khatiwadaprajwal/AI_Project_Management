import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WorkspaceService } from "./workspace.service";

const workspaceService = new WorkspaceService();

export const createWorkspace = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await workspaceService.createWorkspace(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Workspace created successfully.",
      data: result,
    });
  },
);

export const inviteMember = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await workspaceService.inviteMember(workspaceId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User successfully added to workspace.",
    data: result,
  });
});
export const getWorkspace = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await workspaceService.getWorkspaceById(workspaceId, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Workspace retrieved successfully.',
    data: result,
  });
});

export const listMembers = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await workspaceService.listMembers(workspaceId, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Members retrieved successfully.',
    data: result,
  });
});

export const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, userId } = req.params as { workspaceId: string; userId: string };
  const result = await workspaceService.updateMemberRole(workspaceId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member role updated successfully.',
    data: result,
  });
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, userId } = req.params as { workspaceId: string; userId: string };
  const result = await workspaceService.removeMember(workspaceId, userId, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Member removed successfully.',
    data: result,
  });
});

export const transferOwnership = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await workspaceService.transferOwnership(workspaceId, req.body, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ownership transferred successfully.',
    data: result,
  });
});

export const updateWorkspace = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await workspaceService.updateWorkspace(workspaceId, req.body, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Workspace updated successfully.',
    data: result,
  });
});

export const deleteWorkspace = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await workspaceService.deleteWorkspace(workspaceId, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Workspace deleted successfully.',
    data: result,
  });
});