import prisma, { prismaAdmin } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { assertMember, assertLeadIsMember } from '../../utils/authorization';
import { emitDomainEvent } from '../../events/eventBus';
import {
  CreateProjectInput,
  UpdateProjectInput,
  UpdateProjectStatusInput,
  ListProjectsQuery,
} from './project.types';
import { getPaginationParams, buildPaginationMeta  } from '../../utils/pagination/pagination';
class ProjectService {
  public async createProject(
    workspaceId: string,
    payload: CreateProjectInput,
    requesterId: string
  ) {
    await assertMember(workspaceId, requesterId);

    if (payload.leadId) {
      await assertLeadIsMember(workspaceId, payload.leadId);
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
  await assertMember(workspaceId, requesterId);

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
    await assertMember(workspaceId, requesterId);

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
    await assertMember(workspaceId, requesterId);

    const existing = await prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!existing) {
      throw new AppError('Project not found.', 404);
    }

    if (payload.leadId) {
      await assertLeadIsMember(workspaceId, payload.leadId);
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
    await assertMember(workspaceId, requesterId);

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
    await assertMember(workspaceId, requesterId); // or assertLeadPlus/OWNER-ADMIN check per your existing role rule

    const project = await prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date(), deletedBy: requesterId, deleteReason },
    });

    emitDomainEvent('project.deleted', {
      entityType: 'PROJECT',
      entityId: projectId,
      actorId: requesterId,
      action: 'Project deleted',
      meta: { deleteReason },
    });

    return updated;
  }

  public async restoreProject(workspaceId: string, projectId: string, requesterId: string) {
    await assertMember(workspaceId, requesterId);

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

    emitDomainEvent('project.restored', {
      entityType: 'PROJECT',
      entityId: projectId,
      actorId: requesterId,
      action: 'Project restored',
    });

    return restored;
  }


  
}

export const projectService = new ProjectService();