import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { paginationQuerySchema } from '../../utils/pagination/pagination.schema';
export const workspaceIdParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const projectParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    projectId: z.string().min(1),
  }),
});

export const createProjectSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    clientName: z.string().optional(),
    description: z.string().optional(),
    leadId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    projectId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    clientName: z.string().optional(),
    description: z.string().optional(),
    leadId: z.string().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateProjectStatusSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    projectId: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(ProjectStatus),
  }),
});

export const listProjectsQuerySchema = z.object({
  params: z.object({ workspaceId: z.string().min(1) }),
  query: paginationQuerySchema.extend({
    status: z.nativeEnum(ProjectStatus).optional(),
    clientName: z.string().optional(),
    leadId: z.string().optional(),
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({ workspaceId: z.string().min(1), projectId: z.string().min(1) }),
  body: z.object({ deleteReason: z.string().optional() }),
});