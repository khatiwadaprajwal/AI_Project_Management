import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import prisma from "../../config/db";
import { WorkspaceRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
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

export const restrictWorkspaceRole = (...allowedRoles: WorkspaceRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const workspaceId = req.params.workspaceId as string;

      if (!userId || !workspaceId) {
        return next(new AppError("Unauthorized request context.", 400));
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });

      if (!membership) {
        return next(new AppError("You do not belong to this workspace.", 403));
      }

      if (!allowedRoles.includes(membership.role)) {
        return next(
          new AppError(
            `Access Denied. Require one of: ${allowedRoles.join(", ")}`,
            403,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
export const restrictNestedWorkspaceRole = (
  allowedRoles: WorkspaceRole[],
  resolveWorkspaceId: (req: Request) => Promise<string>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError("Unauthorized request context.", 400));
      }

      const workspaceId = await resolveWorkspaceId(req);

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });

      if (!membership) {
        return next(new AppError("You do not belong to this workspace.", 403));
      }

      if (!allowedRoles.includes(membership.role)) {
        return next(
          new AppError(
            `Access Denied. Require one of: ${allowedRoles.join(", ")}`,
            403,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};