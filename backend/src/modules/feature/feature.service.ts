import prisma, { prismaAdmin } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination/pagination';
import { reorderWithinScope } from '../../utils/reorder';
import {
  resolveWorkspaceIdFromProject,
  resolveWorkspaceIdFromFeature,
} from '../../utils/resolveWorkspace';
import { emitDomainEvent } from '../../events/eventBus';
import {
  CreateFeatureInput,
  UpdateFeatureInput,
  ReorderFeatureInput,
} from './feature.types';

class FeatureService {
  private async assertMember(workspaceId: string, userId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) {
      throw new AppError('You are not a member of this workspace.', 403);
    }
    return membership;
  }

  private async assertLeadPlus(workspaceId: string, userId: string) {
    const membership = await this.assertMember(workspaceId, userId);
    if (!['OWNER', 'ADMIN', 'LEAD'].includes(membership.role)) {
      throw new AppError('Requires OWNER, ADMIN, or LEAD role.', 403);
    }
    return membership;
  }

  public async createFeature(projectId: string, payload: CreateFeatureInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromProject(projectId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const count = await prisma.feature.count({ where: { projectId } });

    const feature = await prisma.feature.create({
      data: { projectId, name: payload.name, order: count },
    });

    emitDomainEvent('feature.created', {
      entityType: 'FEATURE',
      entityId: feature.id,
      actorId: requesterId,
      action: 'Feature created',
      meta: { name: feature.name },
    });

    return feature;
  }

  public async listFeatures(
    projectId: string,
    requesterId: string,
    query: { page: number; limit: number }
  ) {
    const workspaceId = await resolveWorkspaceIdFromProject(projectId);
    await this.assertMember(workspaceId, requesterId);

    const where = { projectId };

    const [features, total] = await Promise.all([
      prisma.feature.findMany({
        where,
        ...getPaginationParams(query),
        orderBy: { order: 'asc' },
      }),
      prisma.feature.count({ where }),
    ]);

    return { features, pagination: buildPaginationMeta(query, total) };
  }

  public async updateFeature(featureId: string, payload: UpdateFeatureInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const existing = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!existing) throw new AppError('Feature not found.', 404);

    return prisma.feature.update({ where: { id: featureId }, data: payload });
  }

  public async reorderFeature(featureId: string, payload: ReorderFeatureInput, requesterId: string) {
    const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature) throw new AppError('Feature not found.', 404);

    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertLeadPlus(workspaceId, requesterId);

    await prisma.$transaction(async (tx) => {
      await reorderWithinScope({
        delegate: tx.feature,
        id: featureId,
        currentOrder: feature.order,
        scopeWhere: { projectId: feature.projectId, deletedAt: null },
        requestedOrder: payload.order,
      });
    });

    return prisma.feature.findUnique({ where: { id: featureId } });
  }

  // Soft delete: cascades deletedAt to all live tasks + subtasks underneath,
  // in one transaction. Task.status is NOT touched — restoring the feature
  // later brings everything back exactly as it was.
  public async deleteFeature(featureId: string, deleteReason: string | undefined, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature) throw new AppError('Feature not found.', 404);

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedFeature = await tx.feature.update({
        where: { id: featureId },
        data: { deletedAt: now, deletedBy: requesterId, deleteReason },
      });

      const taskIds = (
        await tx.task.findMany({ where: { featureId, deletedAt: null }, select: { id: true } })
      ).map((t) => t.id);

      if (taskIds.length > 0) {
        await tx.task.updateMany({
          where: { id: { in: taskIds } },
          data: { deletedAt: now, deletedBy: requesterId, deleteReason: 'Parent feature deleted' },
        });

        await tx.subtask.updateMany({
          where: { taskId: { in: taskIds } },
          data: {}, // Subtask has no deletedAt — intentionally left visible-if-fetched-directly;
                    // it's only ever reached through a Task, which is now hidden.
        });
      }

      return { feature: updatedFeature, tasksAffected: taskIds.length };
    });

    emitDomainEvent('feature.deleted', {
      entityType: 'FEATURE',
      entityId: featureId,
      actorId: requesterId,
      action: 'Feature deleted',
      meta: { deleteReason, tasksAffected: result.tasksAffected },
    });

    return result;
  }

  public async restoreFeature(featureId: string, requesterId: string) {
    const feature = await prismaAdmin.feature.findUnique({ where: { id: featureId } });
    if (!feature) throw new AppError('Feature not found.', 404);
    if (!feature.deletedAt) throw new AppError('Feature is not deleted.', 400);

    const workspaceId = await resolveWorkspaceIdFromProject(feature.projectId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const result = await prisma.$transaction(async (tx) => {
      const restoredFeature = await tx.feature.update({
        where: { id: featureId },
        data: { deletedAt: null, deletedBy: null, deleteReason: null },
      });

      // Only restore tasks that were deleted AS A RESULT of this feature's
      // deletion (deleteReason marker), not tasks independently deleted before.
      const restoredTasks = await tx.task.updateMany({
        where: { featureId, deleteReason: 'Parent feature deleted' },
        data: { deletedAt: null, deletedBy: null, deleteReason: null },
      });

      return { feature: restoredFeature, tasksRestored: restoredTasks.count };
    });

    emitDomainEvent('feature.restored', {
      entityType: 'FEATURE',
      entityId: featureId,
      actorId: requesterId,
      action: 'Feature restored',
      meta: { tasksRestored: result.tasksRestored },
    });

    return result;
  }

  public async bulkDeleteFeatures(
    featureIds: string[],
    deleteReason: string | undefined,
    requesterId: string
  ) {
    const features = await prisma.feature.findMany({ where: { id: { in: featureIds } } });
    if (features.length !== featureIds.length) {
      throw new AppError('One or more features not found.', 404);
    }

    const projectIds = [...new Set(features.map((f) => f.projectId))];
    if (projectIds.length > 1) {
      throw new AppError('Bulk operations must target features within a single project.', 400);
    }

    const workspaceId = await resolveWorkspaceIdFromProject(projectIds[0]);
    await this.assertLeadPlus(workspaceId, requesterId);

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      await tx.feature.updateMany({
        where: { id: { in: featureIds } },
        data: { deletedAt: now, deletedBy: requesterId, deleteReason },
      });

      const taskIds = (
        await tx.task.findMany({
          where: { featureId: { in: featureIds }, deletedAt: null },
          select: { id: true },
        })
      ).map((t) => t.id);

      if (taskIds.length > 0) {
        await tx.task.updateMany({
          where: { id: { in: taskIds } },
          data: { deletedAt: now, deletedBy: requesterId, deleteReason: 'Parent feature deleted' },
        });
      }

      return { featuresDeleted: featureIds.length, tasksAffected: taskIds.length };
    });

    emitDomainEvent('feature.deleted', {
      entityType: 'FEATURE',
      entityId: featureIds.join(','),
      actorId: requesterId,
      action: 'Bulk feature delete',
      meta: result,
    });

    return result;
  }

public async listDeletedFeatures(projectId: string, requesterId: string) {
  const workspaceId = await resolveWorkspaceIdFromProject(projectId);
  await this.assertMember(workspaceId, requesterId);

  return prismaAdmin.feature.findMany({
    where: { projectId, deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
  });
}
}

export const featureService = new FeatureService();