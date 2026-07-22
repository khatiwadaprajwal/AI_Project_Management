import prisma from '../../config/db';
import { AppError } from '../../utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination/pagination';
import { resolveWorkspaceIdFromProject, resolveWorkspaceIdFromFeature } from '../../utils/resolveWorkspace';
import { CreateFeatureInput, UpdateFeatureInput, ReorderFeatureInput } from './feature.types';

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

  public async createFeature(projectId: string, payload: CreateFeatureInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromProject(projectId);
    await this.assertMember(workspaceId, requesterId);

    const feature = await prisma.feature.create({
      data: {
        projectId,
        name: payload.name,
        order: payload.order ?? 0,
      },
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

    return {
      features,
      pagination: buildPaginationMeta(query, total),
    };
  }

  public async updateFeature(featureId: string, payload: UpdateFeatureInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertMember(workspaceId, requesterId);

    const feature = await prisma.feature.update({
      where: { id: featureId },
      data: payload,
    });

    return feature;
  }

  public async reorderFeature(featureId: string, payload: ReorderFeatureInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertMember(workspaceId, requesterId);

    const feature = await prisma.feature.update({
      where: { id: featureId },
      data: { order: payload.order },
    });

    return feature;
  }

  public async deleteFeature(featureId: string, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertMember(workspaceId, requesterId);

    await prisma.feature.delete({ where: { id: featureId } });

    return { featureId, deleted: true };
  }
}

export const featureService = new FeatureService();