import prisma, { prismaAdmin } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { emitDomainEvent } from '../../events/eventBus';
import {
  CreateProjectInput,
  UpdateProjectInput,
  UpdateProjectStatusInput,
  ListProjectsQuery,
} from './project.types';
import { getPaginationParams, buildPaginationMeta  } from '../../utils/pagination/pagination';
class ProjectService {
  private async assertMember(workspaceId: string, userId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) {
      throw new AppError('You are not a member of this workspace.', 403);
    }
    return membership;
  }

  private async assertLeadIsMember(workspaceId: string, leadId: string) {
    const leadMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: leadId } },
    });
    if (!leadMembership) {
      throw new AppError('The assigned lead must be a member of this workspace.', 400);
    }
  }

  public async createProject(
    workspaceId: string,
    payload: CreateProjectInput,
    requesterId: string
  ) {
    await this.assertMember(workspaceId, requesterId);

    if (payload.leadId) {
      await this.assertLeadIsMember(workspaceId, payload.leadId);
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name: payload.name,
        clientName: payload.clientName,
        description: payload.description,
        leadId: payload.leadId,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
      },
    });

    return project;
  }

 public async listProjects(workspaceId: string, requesterId: string, query: ListProjectsQuery) {
  await this.assertMember(workspaceId, requesterId);

  const { status, clientName, leadId, page, limit } = query;
  const where = {
    workspaceId,
    ...(status && { status }),
    ...(clientName && { clientName: { contains: clientName, mode: 'insensitive' as const } }),
    ...(leadId && { leadId }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      ...getPaginationParams({ page, limit }),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return {
     projects,
    pagination: buildPaginationMeta({ page, limit }, total),
  };
}

  public async getProjectById(workspaceId: string, projectId: string, requesterId: string) {
    await this.assertMember(workspaceId, requesterId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    return project;
  }

  public async updateProject(
    workspaceId: string,
    projectId: string,
    payload: UpdateProjectInput,
    requesterId: string
  ) {
    await this.assertMember(workspaceId, requesterId);

    const existing = await prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!existing) {
      throw new AppError('Project not found.', 404);
    }

    if (payload.leadId) {
      await this.assertLeadIsMember(workspaceId, payload.leadId);
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: payload,
    });

    return project;
  }

  public async updateProjectStatus(
    workspaceId: string,
    projectId: string,
    payload: UpdateProjectStatusInput,
    requesterId: string
  ) {
    await this.assertMember(workspaceId, requesterId);

    const existing = await prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!existing) {
      throw new AppError('Project not found.', 404);
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: payload.status },
    });

    return project;
  }
    public async deleteProject(
    workspaceId: string,
    projectId: string,
    deleteReason: string | undefined,
    requesterId: string
  ) {
    await this.assertMember(workspaceId, requesterId); // or assertLeadPlus/OWNER-ADMIN check per your existing role rule

    const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date(), deletedBy: requesterId, deleteReason },
    });

    emitDomainEvent('project.deleted' as any, {
      entityType: 'PROJECT',
      entityId: projectId,
      actorId: requesterId,
      action: 'Project deleted',
      meta: { deleteReason },
    });

    return updated;
  }

  public async restoreProject(workspaceId: string, projectId: string, requesterId: string) {
    await this.assertMember(workspaceId, requesterId);

    const project = await prismaAdmin.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!project) {
      throw new AppError('Project not found.', 404);
    }
    if (!project.deletedAt) {
      throw new AppError('Project is not deleted.', 400);
    }

    const restored = await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: null, deletedBy: null, deleteReason: null },
    });

    emitDomainEvent('project.restored' as any, {
      entityType: 'PROJECT',
      entityId: projectId,
      actorId: requesterId,
      action: 'Project restored',
    });

    return restored;
  }


  
}

export const projectService = new ProjectService();