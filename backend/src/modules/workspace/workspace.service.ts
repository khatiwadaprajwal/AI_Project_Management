import bcrypt from "bcrypt";
import crypto from "crypto";
import { WorkspaceRole } from "@prisma/client";
import prisma from "../../config/db";
import { AppError } from "../../utils/AppError";
import { CreateWorkspaceBody, InviteMemberBody,UpdateMemberRoleInput,TransferOwnershipInput,UpdateWorkspaceInput } from "./workspace.types";
import { sendEmail } from "../../utils/mailer";
class WorkspaceService {
  public async createWorkspace(userId: string, payload: CreateWorkspaceBody) {
    const { name } = payload;
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });

    return workspace;
  }
  public async inviteMember(workspaceId: string, payload: InviteMemberBody) {
    const { email, name, role } = payload;

    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;
    let generatedPassword = "";

    if (user) {
      const existingMembership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } },
      });

      if (existingMembership) {
        throw new AppError("User is already a member of this workspace.", 409);
      }

      await prisma.workspaceMember.create({
        data: { workspaceId, userId: user.id, role },
      });
      
      await sendEmail(email, "Workspace Invitation", `You have been added to a new workspace as a ${role}.`);
    } else {
      isNewUser = true;
      
      generatedPassword = crypto.randomBytes(5).toString("hex"); 
      const passwordHash = await bcrypt.hash(generatedPassword, 12);

      await prisma.$transaction(async (tx) => {
        user = await tx.user.create({
          data: { name, email, passwordHash, isFirstLogin: true }, // Forces user to change password
        });
        await tx.workspaceMember.create({
          data: { workspaceId, userId: user.id, role },
        });
      });

     
      await sendEmail(
        email, 
        "Welcome! Your Account Details", 
        `You've been invited to a workspace as ${role}. \n\nLogin Email: ${email}\nTemporary Password: ${generatedPassword}\n\nYou will be required to change this password on your first login.`
      );
    }

    return {
      user: { id: user!.id, name: user!.name, email: user!.email },
      workspaceId,
      role,
      isNewUser,
    };
  }
  public async getWorkspaceById(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!membership) {
    throw new AppError('You are not a member of this workspace.', 403);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new AppError('Workspace not found.', 404);
  }

  return workspace;
}

public async listMembers(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!membership) {
    throw new AppError('You are not a member of this workspace.', 403);
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: 'asc' },
  });

  return members.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
}

public async updateMemberRole(
  workspaceId: string,
  targetUserId: string,
  payload: UpdateMemberRoleInput
) {
  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });

  if (!target) {
    throw new AppError('This user is not a member of this workspace.', 404);
  }

  if (target.role === 'OWNER') {
    throw new AppError(
      'Cannot change the OWNER role directly. Use the transfer-ownership endpoint instead.',
      400
    );
  }

  if (payload.role === 'OWNER') {
    throw new AppError(
      'Cannot assign OWNER role directly. Use the transfer-ownership endpoint instead.',
      400
    );
  }

  const updated = await prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    data: { role: payload.role },
  });

  return { userId: targetUserId, workspaceId, role: updated.role };
}

public async removeMember(workspaceId: string, targetUserId: string, requesterId: string) {
  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });

  if (!target) {
    throw new AppError('This user is not a member of this workspace.', 404);
  }

  if (target.role === 'OWNER') {
    throw new AppError('Cannot remove the workspace OWNER.', 400);
  }

  if (targetUserId === requesterId) {
    throw new AppError('Use the leave-workspace flow to remove yourself.', 400);
  }

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });

  return { userId: targetUserId, workspaceId, removed: true };
}

public async transferOwnership(
  workspaceId: string,
  payload: TransferOwnershipInput,
  requesterId: string
) {
  const { newOwnerUserId } = payload;

  if (newOwnerUserId === requesterId) {
    throw new AppError('You already own this workspace.', 400);
  }

  const newOwnerMembership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: newOwnerUserId } },
  });

  if (!newOwnerMembership) {
    throw new AppError('The new owner must already be a member of this workspace.', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: requesterId } },
      data: { role: 'ADMIN' },
    });

    await tx.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: newOwnerUserId } },
      data: { role: 'OWNER' },
    });

    await tx.workspace.update({
      where: { id: workspaceId },
      data: { ownerId: newOwnerUserId },
    });
  });

  return { workspaceId, newOwnerUserId };
}

public async updateWorkspace(
  workspaceId: string,
  payload: UpdateWorkspaceInput,
  requesterId: string
) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: requesterId } },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new AppError('Only OWNER or ADMIN can update workspace details.', 403);
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: payload.name },
  });

  return workspace;
}

public async deleteWorkspace(workspaceId: string, requesterId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: requesterId } },
  });

  if (!membership || membership.role !== 'OWNER') {
    throw new AppError('Only the OWNER can delete this workspace.', 403);
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { deletedAt: new Date(), deletedBy: requesterId, deleteReason: 'Workspace deleted by owner' },
  });

  return { workspaceId, deleted: true };
}
}

export const workspaceService = new WorkspaceService();
