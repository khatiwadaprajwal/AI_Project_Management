import { Router } from "express";
import {
  createWorkspace,
  inviteMember,
  getWorkspace,
  listMembers,
  updateMemberRole,
  removeMember,
  transferOwnership,
  updateWorkspace,
  deleteWorkspace,
} from "./workspace.controller";
import { validate } from "../../middleware/validate.middleware";
import { protect, attachWorkspaceId } from "../auth/auth.middleware";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  workspaceIdParamsSchema,
  memberParamsSchema,
  updateMemberRoleSchema,
  transferOwnershipSchema,
  updateWorkspaceSchema,
} from "./workspace.validation";

const router = Router();

router.use(protect);

router.post("/", validate(createWorkspaceSchema), createWorkspace);

router.get("/:workspaceId", attachWorkspaceId, validate(workspaceIdParamsSchema), getWorkspace);
router.patch("/:workspaceId", attachWorkspaceId, validate(updateWorkspaceSchema), updateWorkspace);
router.delete("/:workspaceId", attachWorkspaceId, validate(workspaceIdParamsSchema), deleteWorkspace);

router.get("/:workspaceId/members", attachWorkspaceId, validate(workspaceIdParamsSchema), listMembers);
router.patch(
  "/:workspaceId/members/:userId",
  attachWorkspaceId,
  validate(updateMemberRoleSchema),
  updateMemberRole,
);
router.delete(
  "/:workspaceId/members/:userId",
  attachWorkspaceId,
  validate(memberParamsSchema),
  removeMember,
);

router.post(
  "/:workspaceId/invites",
  attachWorkspaceId,
  validate(inviteMemberSchema),
  inviteMember,
);

router.post(
  "/:workspaceId/transfer-ownership",
  attachWorkspaceId,
  validate(transferOwnershipSchema),
  transferOwnership,
);

export const workspaceRoutes = router;