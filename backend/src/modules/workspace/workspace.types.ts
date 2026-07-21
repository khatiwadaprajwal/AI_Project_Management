import { z } from "zod";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  transferOwnershipSchema,
  updateWorkspaceSchema,
} from "./workspace.validation";

export type CreateWorkspaceBody = z.infer<typeof createWorkspaceSchema>["body"];
export type InviteMemberBody = z.infer<typeof inviteMemberSchema>["body"];
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>['body'];
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>['body'];
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>['body'];