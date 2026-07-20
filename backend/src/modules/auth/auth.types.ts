import { z } from "zod";
import { registerSchema, loginSchema } from "./auth.validation";

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
  refreshToken: string;
}
