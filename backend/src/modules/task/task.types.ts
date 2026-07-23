import { z } from 'zod';
import {
  createTaskSchema, updateTaskSchema, updateTaskStatusSchema, assignTaskSchema,
  reorderTaskSchema, deleteTaskSchema, bulkDeleteTasksSchema, listTasksQuerySchema,
  createSubtaskSchema, updateSubtaskSchema, reorderSubtaskSchema, bulkDeleteSubtasksSchema,
} from './task.validation';

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>['body'];
export type AssignTaskInput = z.infer<typeof assignTaskSchema>['body'];
export type ReorderTaskInput = z.infer<typeof reorderTaskSchema>['body'];
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>['body'];
export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>['body'];
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>['query'];
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>['body'];
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>['body'];
export type ReorderSubtaskInput = z.infer<typeof reorderSubtaskSchema>['body'];
export type BulkDeleteSubtasksInput = z.infer<typeof bulkDeleteSubtasksSchema>['body'];