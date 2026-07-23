import prisma, { prismaAdmin } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination/pagination';
import { reorderWithinScope } from '../../utils/reorder';
import {
  resolveWorkspaceIdFromProject,
  resolveWorkspaceIdFromFeature,
  resolveWorkspaceIdFromTask,
} from '../../utils/resolveWorkspace';
import { isValidTransition } from './task.statemachine';
import { emitDomainEvent } from '../../events/eventBus';
import {
  CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, AssignTaskInput,
  ReorderTaskInput, ListTasksQuery, CreateSubtaskInput, UpdateSubtaskInput, ReorderSubtaskInput,
} from './task.types';

class TaskService {
  private async assertMember(workspaceId: string, userId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) throw new AppError('You are not a member of this workspace.', 403);
    return membership;
  }

  private async assertLeadPlus(workspaceId: string, userId: string) {
    const membership = await this.assertMember(workspaceId, userId);
    if (!['OWNER', 'ADMIN', 'LEAD'].includes(membership.role)) {
      throw new AppError('Requires OWNER, ADMIN, or LEAD role.', 403);
    }
    return membership;
  }

  private async assertAssigneeIsMember(workspaceId: string, assigneeId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: assigneeId } },
    });
    if (!membership) throw new AppError('The assignee must be a member of this workspace.', 400);
  }

  public async createTask(featureId: string, payload: CreateTaskInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromFeature(featureId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const feature = await prisma.feature.findUnique({ where: { id: featureId } });
    if (!feature) throw new AppError('Feature not found.', 404);

    if (payload.assigneeId) {
      await this.assertAssigneeIsMember(workspaceId, payload.assigneeId);
    }

    const count = await prisma.task.count({ where: { featureId } });

    const task = await prisma.task.create({
      data: {
        featureId,
        projectId: feature.projectId,
        title: payload.title,
        description: payload.description,
        assigneeId: payload.assigneeId,
        estimateDays: payload.estimateDays,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        priority: payload.priority ?? 'MEDIUM',
        storyPoints: payload.storyPoints,
        order: count,
      },
    });

    emitDomainEvent('task.created', {
      entityType: 'TASK', entityId: task.id, actorId: requesterId,
      action: 'Task created', meta: { title: task.title },
    });

    return task;
  }

  public async listMyTasks(requesterId: string, query: { page: number; limit: number }) {
    const where = { assigneeId: requesterId };
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, ...getPaginationParams(query), orderBy: { createdAt: 'desc' } }),
      prisma.task.count({ where }),
    ]);
    return { tasks, pagination: buildPaginationMeta(query, total) };
  }

  public async listTasksByProject(projectId: string, requesterId: string, query: ListTasksQuery) {
    const workspaceId = await resolveWorkspaceIdFromProject(projectId);
    await this.assertMember(workspaceId, requesterId);

    const { status, assigneeId, priority, featureId, page, limit } = query;
    const where = {
      projectId,
      ...(status && { status }),
      ...(assigneeId && { assigneeId }),
      ...(priority && { priority }),
      ...(featureId && { featureId }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, ...getPaginationParams({ page, limit }), orderBy: { createdAt: 'desc' } }),
      prisma.task.count({ where }),
    ]);

    return { tasks, pagination: buildPaginationMeta({ page, limit }, total) };
  }

  public async getTaskById(taskId: string, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertMember(workspaceId, requesterId);

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { subtasks: true } });
    if (!task) throw new AppError('Task not found.', 404);
    return task;
  }

  public async updateTask(taskId: string, payload: UpdateTaskInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw new AppError('Task not found.', 404);

    return prisma.task.update({ where: { id: taskId }, data: payload });
  }

  public async updateTaskStatus(taskId: string, payload: UpdateTaskStatusInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertMember(workspaceId, requesterId);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found.', 404);

    if (task.assigneeId && task.assigneeId !== requesterId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: requesterId } },
      });
      const isLeadOrAbove = membership && ['OWNER', 'ADMIN', 'LEAD'].includes(membership.role);
      if (!isLeadOrAbove) {
        throw new AppError('Only the assignee or LEAD+ can change this task status.', 403);
      }
    }

    if (!isValidTransition(task.status, payload.status)) {
      throw new AppError(`Cannot transition task from ${task.status} to ${payload.status}.`, 400);
    }

    if (payload.status === 'BLOCKED' && !payload.blockedReason) {
      throw new AppError('blockedReason is required when setting status to BLOCKED.', 400);
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: payload.status,
        blockedReason: payload.status === 'BLOCKED' ? payload.blockedReason : null,
      },
    });

    emitDomainEvent('task.statusChanged', {
      entityType: 'TASK', entityId: taskId, actorId: requesterId,
      action: 'Task status changed', meta: { from: task.status, to: payload.status },
    });

    return updated;
  }

  public async assignTask(taskId: string, payload: AssignTaskInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found.', 404);

    if (payload.assigneeId) {
      await this.assertAssigneeIsMember(workspaceId, payload.assigneeId);
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: payload.assigneeId },
    });

    emitDomainEvent('task.assigned', {
      entityType: 'TASK', entityId: taskId, actorId: requesterId,
      action: 'Task assigned', meta: { assigneeId: payload.assigneeId },
    });

    return updated;
  }

  public async reorderTask(taskId: string, payload: ReorderTaskInput, requesterId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found.', 404);

    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertLeadPlus(workspaceId, requesterId);

    await prisma.$transaction(async (tx) => {
      await reorderWithinScope({
        delegate: tx.task,
        id: taskId,
        currentOrder: task.order,
        scopeWhere: { featureId: task.featureId, deletedAt: null },
        requestedOrder: payload.order,
      });
    });

    return prisma.task.findUnique({ where: { id: taskId } });
  }

  // Soft delete only — Subtasks are left as-is (they're only reachable
  // through this task, which is now hidden by the default client).
  public async deleteTask(taskId: string, deleteReason: string | undefined, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found.', 404);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date(), deletedBy: requesterId, deleteReason },
    });

    emitDomainEvent('task.deleted', {
      entityType: 'TASK', entityId: taskId, actorId: requesterId,
      action: 'Task deleted', meta: { deleteReason },
    });

    return updated;
  }

  public async restoreTask(taskId: string, requesterId: string) {
    const task = await prismaAdmin.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found.', 404);
    if (!task.deletedAt) throw new AppError('Task is not deleted.', 400);

    // Reject if parent feature is still deleted — restoring a task shouldn't
    // silently un-delete a feature someone deliberately removed.
    const feature = await prismaAdmin.feature.findUnique({ where: { id: task.featureId } });
    if (feature?.deletedAt) {
      throw new AppError(
        'The parent feature is deleted. Restore the feature first before restoring this task.',
        409
      );
    }

    const workspaceId = await resolveWorkspaceIdFromProject(task.projectId);
    await this.assertLeadPlus(workspaceId, requesterId);

    const restored = await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: null, deletedBy: null, deleteReason: null },
    });

    emitDomainEvent('task.restored', {
      entityType: 'TASK', entityId: taskId, actorId: requesterId, action: 'Task restored',
    });

    return restored;
  }

  public async bulkDeleteTasks(taskIds: string[], deleteReason: string | undefined, requesterId: string) {
    const tasks = await prisma.task.findMany({ where: { id: { in: taskIds } } });
    if (tasks.length !== taskIds.length) throw new AppError('One or more tasks not found.', 404);

    const projectIds = [...new Set(tasks.map((t) => t.projectId))];
    if (projectIds.length > 1) {
      throw new AppError('Bulk operations must target tasks within a single project.', 400);
    }

    const workspaceId = await resolveWorkspaceIdFromProject(projectIds[0]);
    await this.assertLeadPlus(workspaceId, requesterId);

    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { deletedAt: new Date(), deletedBy: requesterId, deleteReason },
    });

    emitDomainEvent('task.deleted', {
      entityType: 'TASK', entityId: taskIds.join(','), actorId: requesterId,
      action: 'Bulk task delete', meta: { count: taskIds.length, deleteReason },
    });

    return { tasksDeleted: taskIds.length };
  }

  // ── Subtasks — hard delete, leaf entity, no audit value ──

  public async createSubtask(taskId: string, payload: CreateSubtaskInput, requesterId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await this.assertMember(workspaceId, requesterId);

    const count = await prisma.subtask.count({ where: { taskId } });

    return prisma.subtask.create({
      data: { taskId, title: payload.title, order: count },
    });
  }

  public async updateSubtask(subtaskId: string, payload: UpdateSubtaskInput, requesterId: string) {
    const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
    if (!subtask) throw new AppError('Subtask not found.', 404);

    const workspaceId = await resolveWorkspaceIdFromTask(subtask.taskId);
    await this.assertMember(workspaceId, requesterId);

    return prisma.subtask.update({ where: { id: subtaskId }, data: payload });
  }

  public async reorderSubtask(subtaskId: string, payload: ReorderSubtaskInput, requesterId: string) {
    const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
    if (!subtask) throw new AppError('Subtask not found.', 404);

    const workspaceId = await resolveWorkspaceIdFromTask(subtask.taskId);
    await this.assertMember(workspaceId, requesterId);

    await prisma.$transaction(async (tx) => {
      await reorderWithinScope({
        delegate: tx.subtask,
        id: subtaskId,
        currentOrder: subtask.order,
        scopeWhere: { taskId: subtask.taskId },
        requestedOrder: payload.order,
      });
    });

    return prisma.subtask.findUnique({ where: { id: subtaskId } });
  }

  public async deleteSubtask(subtaskId: string, requesterId: string) {
    const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
    if (!subtask) throw new AppError('Subtask not found.', 404);

    const workspaceId = await resolveWorkspaceIdFromTask(subtask.taskId);
    await this.assertMember(workspaceId, requesterId);

    await prisma.subtask.delete({ where: { id: subtaskId } });

    emitDomainEvent('subtask.deleted', {
      entityType: 'TASK', entityId: subtask.taskId, actorId: requesterId,
      action: 'Subtask deleted', meta: { subtaskId, title: subtask.title },
    });

    return { subtaskId, deleted: true };
  }

  public async bulkDeleteSubtasks(subtaskIds: string[], requesterId: string) {
    const subtasks = await prisma.subtask.findMany({ where: { id: { in: subtaskIds } } });
    if (subtasks.length !== subtaskIds.length) throw new AppError('One or more subtasks not found.', 404);

    const taskIds = [...new Set(subtasks.map((s) => s.taskId))];
    if (taskIds.length > 1) {
      throw new AppError('Bulk operations must target subtasks within a single task.', 400);
    }

    const workspaceId = await resolveWorkspaceIdFromTask(taskIds[0]);
    await this.assertMember(workspaceId, requesterId);

    await prisma.subtask.deleteMany({ where: { id: { in: subtaskIds } } });

    return { subtasksDeleted: subtaskIds.length };
  }
}

export const taskService = new TaskService();