import { TaskStatus } from '@prisma/client';
import prisma from '../../config/db';
import { AppError } from '../../utils/AppError';
import { assertMember } from '../../utils/authorization';
import { resolveWorkspaceIdFromTask } from '../../utils/resolveWorkspace';
import { isValidTransition } from '../task/task.statemachine';
import { emitDomainEvent } from '../../events/eventBus';
import type { CreateQaReviewInput } from './qaReview.types';

class QaReviewService {
  async create(taskId: string, payload: CreateQaReviewInput, reviewerId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    const membership = await assertMember(workspaceId, reviewerId);

    const canReview = membership.role === 'QA' || ['OWNER', 'ADMIN', 'LEAD'].includes(membership.role);
    if (!canReview) {
      throw new AppError('Only QA, OWNER, ADMIN, or LEAD can submit QA reviews.', 403);
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found.', 404);

    if (task.status !== 'READY_FOR_QA') {
      throw new AppError('Task must be in READY_FOR_QA status to be reviewed.', 400);
    }

    const targetStatus: TaskStatus = payload.result === 'PASS' ? 'COMPLETED' : 'REOPENED';

    if (!isValidTransition(task.status, targetStatus)) {
      throw new AppError(`Cannot transition task from ${task.status} to ${targetStatus} via QA review.`, 400);
    }

    const [review] = await prisma.$transaction(async (tx) => {
      const r = await tx.qAReview.create({
        data: {
          taskId,
          reviewerId,
          result: payload.result,
          note: payload.note,
        },
      });

      await tx.task.update({
        where: { id: taskId },
        data: { status: targetStatus },
      });

      return [r];
    });

    emitDomainEvent('qa.reviewed', {
      entityType: 'TASK',
      entityId: taskId,
      actorId: reviewerId,
      action: `QA review: ${payload.result}`,
      meta: { result: payload.result, note: payload.note, previousStatus: task.status, newStatus: targetStatus },
    });

    return review;
  }

  async listByTask(taskId: string, userId: string) {
    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    await assertMember(workspaceId, userId);

    return prisma.qAReview.findMany({
      where: { taskId },
      orderBy: { reviewedAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

export const qaReviewService = new QaReviewService();
