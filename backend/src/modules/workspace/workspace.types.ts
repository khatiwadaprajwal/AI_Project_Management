import { z } from "zod";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
} from "./workspace.validation";

export type CreateWorkspaceBody = z.infer<typeof createWorkspaceSchema>["body"];
export type InviteMemberBody = z.infer<typeof inviteMemberSchema>["body"];
