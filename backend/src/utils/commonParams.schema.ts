import { z } from 'zod';

export const projectIdParamsSchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
});

export const featureIdParamsSchema = z.object({
  params: z.object({ featureId: z.string().min(1) }),
});

export const taskIdParamsSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
});

export const subtaskIdParamsSchema = z.object({
  params: z.object({ subtaskId: z.string().min(1) }),
});

export const workspaceIdParamsSchema = z.object({
  params: z.object({ workspaceId: z.string().min(1) }),
});