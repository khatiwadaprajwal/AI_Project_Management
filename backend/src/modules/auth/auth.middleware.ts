import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      workspaceId?: string;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please provide a token.", 401),
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token.", 401));
  }
};


export const attachWorkspaceId = (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.params.workspaceId as string;

  if (!workspaceId) {
    return next(new AppError("Unauthorized request context.", 400));
  }

  req.workspaceId = workspaceId;
  next();
};


export const attachNestedWorkspaceId = (
  resolveWorkspaceId: (req: Request) => Promise<string>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.workspaceId = await resolveWorkspaceId(req);
      next();
    } catch (error) {
      next(error);
    }
  };
};