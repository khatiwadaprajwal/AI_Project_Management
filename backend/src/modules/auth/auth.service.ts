import bcrypt from "bcrypt";
import { WorkspaceRole } from "@prisma/client";
import prisma from "../../config/db";
import { AppError } from "../../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/tokenGenerate";
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  VerifyOtpInput,
  ChangePasswordInput,
} from "./auth.types";
import { sendEmail } from "../../utils/mailer";

class AuthService {

  public async register(
    payload: RegisterInput
  ): Promise<{ message: string; email: string }> {
    const { name, email, password, workspaceName } = payload;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError("Email is already registered.", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);


    await prisma.tempUser.upsert({
      where: { email },
      update: { name, passwordHash, workspaceName, otp: otpHash, otpExpiresAt },
      create: { name, email, passwordHash, workspaceName, otp: otpHash, otpExpiresAt },
    });

    await sendEmail(
      email,
      "Verify your account",
      `Your verification OTP is: ${otp}. It will expire in 15 minutes.`
    );

    return {
      email,
      message: "OTP sent successfully to email. Please verify to continue.",
    };
  }

  public async verifyOtp(
    payload: VerifyOtpInput
  ): Promise<{ data: AuthResponse; accessToken: string }> {
    const { email, otp } = payload;

    const tempUser = await prisma.tempUser.findUnique({ where: { email } });
    if (!tempUser) throw new AppError("No pending registration found for this email.", 404);

    if (!(await bcrypt.compare(otp, tempUser.otp))) throw new AppError("Invalid OTP.", 400);
    if (tempUser.otpExpiresAt < new Date()) throw new AppError("OTP has expired.", 400);

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${tempUser.workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: tempUser.name,
          email: tempUser.email,
          passwordHash: tempUser.passwordHash,
          isFirstLogin: false, // Registered via OTP, so they know their password
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: tempUser.workspaceName,
          slug,
          ownerId: user.id,
          members: { create: { userId: user.id, role: WorkspaceRole.OWNER } },
        },
      });


      await tx.tempUser.delete({ where: { email } });

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
          isFirstLogin: result.user.isFirstLogin,
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
    payload: LoginInput
  ): Promise<{ data: AuthResponse; accessToken: string; message?: string }> {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaceMembers: { include: { workspace: true } },
      },
    });

    if (!user || !user.passwordHash)
      throw new AppError("Invalid email or password.", 401);

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new AppError("Invalid email or password.", 401);

    const accessToken = generateAccessToken(user.id);

    if (user.isFirstLogin) {
      return {
        accessToken, 
        data: {
          user: { id: user.id, name: user.name, email: user.email, isFirstLogin: true },
          workspaces: [], 
          refreshToken: "",
        },
      };
    }

    const userWorkspaces = user.workspaceMembers.map((member) => ({
      id: member.workspace.id,
      name: member.workspace.name,
      slug: member.workspace.slug,
      role: member.role,
    }));

    const refreshToken = generateRefreshToken(user.id);

    return {
      accessToken,
      data: {
        user: { id: user.id, name: user.name, email: user.email, isFirstLogin: false },
        workspaces: userWorkspaces,
        refreshToken,
      },
    };
  }

  public async changePassword(
    userId: string,
    payload: ChangePasswordInput
  ): Promise<{ data: AuthResponse; accessToken: string }> {
    const passwordHash = await bcrypt.hash(payload.newPassword, 12);


    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, isFirstLogin: false },
      include: {
        workspaceMembers: { include: { workspace: true } },
      },
    });

    const userWorkspaces = updatedUser.workspaceMembers.map((member) => ({
      id: member.workspace.id,
      name: member.workspace.name,
      slug: member.workspace.slug,
      role: member.role,
    }));

    
    const accessToken = generateAccessToken(updatedUser.id);
    const refreshToken = generateRefreshToken(updatedUser.id);

    return {
      accessToken,
      data: {
        user: { 
          id: updatedUser.id, 
          name: updatedUser.name, 
          email: updatedUser.email, 
          isFirstLogin: false 
        },
        workspaces: userWorkspaces,
        refreshToken,
      },
    };
  }
}
export const authService = new AuthService();