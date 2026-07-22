import prisma from '../config/db';
import { AppError } from './AppError';

export const resolveWorkspaceIdFromProject = async (projectId: string): Promise<string> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  return project.workspaceId;
};

export const resolveWorkspaceIdFromFeature = async (featureId: string): Promise<string> => {
  const feature = await prisma.feature.findUnique({
    where: { id: featureId },
    select: { project: { select: { workspaceId: true } } },
  });

  if (!feature) {
    throw new AppError('Feature not found.', 404);
  }

  return feature.project.workspaceId;
};

export const resolveWorkspaceIdFromTask = async (taskId: string): Promise<string> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { project: { select: { workspaceId: true } } },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  return task.project.workspaceId;
};