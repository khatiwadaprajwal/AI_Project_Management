import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  PORT: z.string().default("4000"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
});

export const env = EnvSchema.parse(process.env);
