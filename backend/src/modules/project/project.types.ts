import { z } from 'zod';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
  listProjectsQuerySchema,
} from './project.validation';

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>['body'];
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>['query'];