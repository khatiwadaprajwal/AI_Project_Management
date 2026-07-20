import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User and Workspace created successfully.",
    token: result.accessToken,
    data: result.data,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged in successfully.",
    token: result.accessToken,
    data: result.data,
  });
});
