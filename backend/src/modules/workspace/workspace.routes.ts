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
import { protect, restrictWorkspaceRole } from "../auth/auth.middleware";
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

router.get("/:workspaceId", validate(workspaceIdParamsSchema), getWorkspace);
router.patch("/:workspaceId", validate(updateWorkspaceSchema), updateWorkspace);
router.delete("/:workspaceId", validate(workspaceIdParamsSchema), deleteWorkspace);

router.get("/:workspaceId/members", validate(workspaceIdParamsSchema), listMembers);
router.patch(
  "/:workspaceId/members/:userId",
  restrictWorkspaceRole("OWNER", "ADMIN"),
  validate(updateMemberRoleSchema),
  updateMemberRole,
);
router.delete(
  "/:workspaceId/members/:userId",
  restrictWorkspaceRole("OWNER", "ADMIN"),
  validate(memberParamsSchema),
  removeMember,
);

router.post(
  "/:workspaceId/invites",
  restrictWorkspaceRole("OWNER", "ADMIN"),
  validate(inviteMemberSchema),
  inviteMember,
);

router.post(
  "/:workspaceId/transfer-ownership",
  restrictWorkspaceRole("OWNER"),
  validate(transferOwnershipSchema),
  transferOwnership,
);

export const workspaceRoutes = router;