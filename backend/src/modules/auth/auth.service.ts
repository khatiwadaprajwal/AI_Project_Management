import bcrypt from "bcrypt";
import { WorkspaceRole } from "@prisma/client";
import prisma from "../../config/db";
import { AppError } from "../../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/tokenGenerate";
import { RegisterInput, LoginInput, AuthResponse } from "./auth.types";

export class AuthService {
  public async register(
    payload: RegisterInput,
  ): Promise<{ data: AuthResponse; accessToken: string }> {
    const { name, email, password, workspaceName } = payload;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError("Email is already registered.", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash },
      });
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          ownerId: user.id,
          members: { create: { userId: user.id, role: WorkspaceRole.OWNER } },
        },
      });
      return { user, workspace };
    });

    const accessToken = generateAccessToken(result.user.id);
    const refreshToken = generateRefreshToken(result.user.id);

    return {
      accessToken,
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        workspaces: [
          {
            id: result.workspace.id,
            name: result.workspace.name,
            slug: result.workspace.slug,
            role: WorkspaceRole.OWNER,
          },
        ],
        refreshToken,
      },
    };
  }

  public async login(
    payload: LoginInput,
  ): Promise<{ data: AuthResponse; accessToken: string }> {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaceMembers: { include: { workspace: true } }, // Get ALL workspaces
      },
    });

    if (!user || !user.passwordHash)
      throw new AppError("Invalid email or password.", 401);

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new AppError("Invalid email or password.", 401);

    const userWorkspaces = user.workspaceMembers.map((member) => ({
      id: member.workspace.id,
      name: member.workspace.name,
      slug: member.workspace.slug,
      role: member.role,
    }));

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        workspaces: userWorkspaces,
        refreshToken,
      },
    };
  }
}
