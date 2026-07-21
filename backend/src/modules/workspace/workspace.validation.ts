import { z } from "zod";
import { WorkspaceRole } from "@prisma/client";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters"),
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid("Invalid workspace ID format"),
  }),
  body: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(WorkspaceRole),
  }),
});
export const workspaceIdParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const memberParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    userId: z.string().min(1),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    userId: z.string().min(1),
  }),
  body: z.object({
    role: z.nativeEnum(WorkspaceRole),
  }),
});

export const transferOwnershipSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  body: z.object({
    newOwnerUserId: z.string().min(1),
  }),
});

export const updateWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});
