import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { paginationQuerySchema } from '../../utils/pagination/pagination.schema';
export { featureIdParamsSchema, taskIdParamsSchema, projectIdParamsSchema, subtaskIdParamsSchema } from "../../utils/commonParams.schema";

export const createTaskSchema = z.object({
  params: z.object({ featureId: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    estimateDays: z.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    storyPoints: z.number().int().positive().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    estimateDays: z.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    storyPoints: z.number().int().positive().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({
    status: z.nativeEnum(TaskStatus),
    blockedReason: z.string().optional(),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({ assigneeId: z.string().min(1).nullable() }),
});

export const reorderTaskSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({ order: z.number().int().min(0) }),
});

export const deleteTaskSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({ deleteReason: z.string().optional() }),
});

export const bulkDeleteTasksSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().min(1)).min(1),
    deleteReason: z.string().optional(),
  }),
});

export const listTasksQuerySchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
  query: paginationQuerySchema.extend({
    status: z.nativeEnum(TaskStatus).optional(),
    assigneeId: z.string().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    featureId: z.string().optional(),
  }),
});

export const listMyTasksQuerySchema = z.object({
  query: paginationQuerySchema,
});

export const createSubtaskSchema = z.object({
  params: z.object({ taskId: z.string().min(1) }),
  body: z.object({ title: z.string().min(1, 'Subtask title is required') }),
});

export const updateSubtaskSchema = z.object({
  params: z.object({ subtaskId: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).optional(),
    isDone: z.boolean().optional(),
  }),
});

export const reorderSubtaskSchema = z.object({
  params: z.object({ subtaskId: z.string().min(1) }),
  body: z.object({ order: z.number().int().min(0) }),
});

export const bulkDeleteSubtasksSchema = z.object({
  body: z.object({ subtaskIds: z.array(z.string().min(1)).min(1) }),
});
