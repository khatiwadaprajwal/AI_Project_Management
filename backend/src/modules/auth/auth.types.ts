import { z } from "zod";
import { registerSchema, loginSchema,verifyOtpSchema, changePasswordSchema  } from "./auth.validation";

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isFirstLogin:boolean;
  };
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
  refreshToken: string;
}
