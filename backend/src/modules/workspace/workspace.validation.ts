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
