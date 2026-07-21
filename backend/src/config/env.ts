import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  PORT: z.string().default("8000"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  GMAIL_USER: z.string().email(),
  GMAIL_PASS: z.string(),
  GMAIL_HOST: z.string().default("smtp.gmail.com"),
  GMAIL_PORT: z.string().default("587"),
});
const _env = EnvSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
