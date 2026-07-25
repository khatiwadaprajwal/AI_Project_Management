import prisma from '../config/db';
import { AppError } from './AppError';

export async function assertMember(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new AppError('You are not a member of this workspace.', 403);
  return membership;
}

export async function assertLeadPlus(workspaceId: string, userId: string) {
  const membership = await assertMember(workspaceId, userId);
  if (!['OWNER', 'ADMIN', 'LEAD'].includes(membership.role)) {
    throw new AppError('Requires OWNER, ADMIN, or LEAD role.', 403);
  }
  return membership;
}

export async function assertAssigneeIsMember(workspaceId: string, assigneeId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: assigneeId } },
  });
  if (!membership) throw new AppError('The assignee must be a member of this workspace.', 400);
}

export async function assertLeadIsMember(workspaceId: string, leadId: string) {
  const leadMembership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: leadId } },
  });
  if (!leadMembership) throw new AppError('The assigned lead must be a member of this workspace.', 400);
}
