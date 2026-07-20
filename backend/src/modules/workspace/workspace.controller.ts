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
