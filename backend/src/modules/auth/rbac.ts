import { WorkspaceRole } from "@prisma/client";

export const Permissions = {
  // Workspace
  WORKSPACE_UPDATE: "workspace:update",
  WORKSPACE_DELETE: "workspace:delete",
  WORKSPACE_MANAGE_MEMBERS: "workspace:manage_members",

  // Project
  PROJECT_CREATE: "project:create",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  PROJECT_VIEW: "project:view",

  // Feature
  FEATURE_CREATE: "feature:create",
  FEATURE_UPDATE: "feature:update",
  FEATURE_DELETE: "feature:delete",
  FEATURE_VIEW: "feature:view",

  // Task
  TASK_CREATE: "task:create",
  TASK_ASSIGN: "task:assign",
  TASK_UPDATE_STATUS: "task:update_status",
  TASK_DELETE: "task:delete",
  TASK_VIEW_ALL: "task:view_all",

  // QA
  QA_REVIEW: "qa:review",
  QA_VIEW: "qa:view",

  // Members
  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",
  MEMBER_VIEW: "member:view",

  // Reports
  REPORT_VIEW: "report:view",
  REPORT_GENERATE: "report:generate",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

const ALL = Object.values(Permissions);

const RolePermissions: Record<WorkspaceRole, Permission[]> = {
  OWNER: ALL,
  ADMIN: [
    Permissions.WORKSPACE_UPDATE,
    Permissions.WORKSPACE_MANAGE_MEMBERS,
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_UPDATE,
    Permissions.PROJECT_DELETE,
    Permissions.PROJECT_VIEW,
    Permissions.FEATURE_CREATE,
    Permissions.FEATURE_UPDATE,
    Permissions.FEATURE_DELETE,
    Permissions.FEATURE_VIEW,
    Permissions.TASK_CREATE,
    Permissions.TASK_ASSIGN,
    Permissions.TASK_UPDATE_STATUS,
    Permissions.TASK_DELETE,
    Permissions.TASK_VIEW_ALL,
    Permissions.QA_REVIEW,
    Permissions.QA_VIEW,
    Permissions.MEMBER_INVITE,
    Permissions.MEMBER_REMOVE,
    Permissions.MEMBER_VIEW,
    Permissions.REPORT_VIEW,
    Permissions.REPORT_GENERATE,
    Permissions.SETTINGS_VIEW,
    Permissions.SETTINGS_UPDATE,
  ],
  LEAD: [
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_UPDATE,
    Permissions.PROJECT_VIEW,
    Permissions.FEATURE_CREATE,
    Permissions.FEATURE_UPDATE,
    Permissions.FEATURE_DELETE,
    Permissions.FEATURE_VIEW,
    Permissions.TASK_CREATE,
    Permissions.TASK_ASSIGN,
    Permissions.TASK_UPDATE_STATUS,
    Permissions.TASK_VIEW_ALL,
    Permissions.QA_VIEW,
    Permissions.MEMBER_VIEW,
    Permissions.REPORT_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
  SUPERVISOR: [
    Permissions.PROJECT_VIEW,
    Permissions.FEATURE_VIEW,
    Permissions.TASK_VIEW_ALL,
    Permissions.TASK_UPDATE_STATUS,
    Permissions.QA_VIEW,
    Permissions.REPORT_VIEW,
    Permissions.MEMBER_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
  DEVELOPER: [
    Permissions.PROJECT_VIEW,
    Permissions.FEATURE_VIEW,
    Permissions.TASK_CREATE,
    Permissions.TASK_UPDATE_STATUS,
    Permissions.TASK_VIEW_ALL,
    Permissions.QA_VIEW,
    Permissions.MEMBER_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
  QA: [
    Permissions.PROJECT_VIEW,
    Permissions.FEATURE_VIEW,
    Permissions.TASK_VIEW_ALL,
    Permissions.QA_REVIEW,
    Permissions.QA_VIEW,
    Permissions.MEMBER_VIEW,
    Permissions.SETTINGS_VIEW,
  ],
};

export function getPermissionsForRole(role: WorkspaceRole): Permission[] {
  return RolePermissions[role];
}

export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return RolePermissions[role].includes(permission);
}
