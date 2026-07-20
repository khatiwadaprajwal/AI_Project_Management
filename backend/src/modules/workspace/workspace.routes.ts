import { Router } from "express";
import { createWorkspace, inviteMember } from "./workspace.controller";
import { validate } from "../../middleware/validate.middleware";
import { protect, restrictWorkspaceRole } from "../auth/auth.middleware";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
} from "./workspace.validation";

const router = Router();

router.post("/", protect, validate(createWorkspaceSchema), createWorkspace);

router.post(
  "/:workspaceId/invites",
  protect,
  restrictWorkspaceRole("OWNER", "ADMIN"),
  validate(inviteMemberSchema),
  inviteMember,
);

export const workspaceRoutes = router;
