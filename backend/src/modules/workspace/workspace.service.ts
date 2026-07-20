import bcrypt from "bcrypt";
import { WorkspaceRole } from "@prisma/client";
import prisma from "../../config/db";
import { AppError } from "../../utils/AppError";
import { CreateWorkspaceBody, InviteMemberBody } from "./workspace.types";

export class WorkspaceService {
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
    } else {
      isNewUser = true;
      const tempPassword = "TempPassword123!"; // Real world: Send magic link
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      await prisma.$transaction(async (tx) => {
        user = await tx.user.create({ data: { name, email, passwordHash } });
        await tx.workspaceMember.create({
          data: { workspaceId, userId: user!.id, role },
        });
      });
    }

    return {
      user: { id: user!.id, name: user!.name, email: user!.email },
      workspaceId,
      role,
      isNewUser,
    };
  }
}
