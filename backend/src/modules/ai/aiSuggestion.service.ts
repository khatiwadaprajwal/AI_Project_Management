import prisma from '../../config/db';
import { AppError } from '../../utils/AppError';
import { suggestionProvider } from './providers';
import { taskService } from '../task/task.service';
import type { SuggestionDraft } from './providers/suggestionProvider.interface';

class AiSuggestionService {
  async generateForFeature(featureId: string) {
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
      include: { project: { select: { name: true } } },
    });
    if (!feature) throw new AppError('Feature not found.', 404);

    const existingTasks = await prisma.task.findMany({
      where: { featureId, deletedAt: null },
      select: { title: true },
    });

    const drafts: SuggestionDraft[] = await suggestionProvider.generateTaskSuggestions({
      projectName: feature.project.name,
      featureName: feature.name,
      existingTaskTitles: existingTasks.map((t) => t.title),
    });

    if (drafts.length === 0) return [];

    await prisma.aiSuggestion.deleteMany({
      where: { entityType: 'FEATURE', entityId: featureId, status: 'PENDING' },
    });

    await prisma.aiSuggestion.createMany({
      data: drafts.map((d, i) => ({
        entityType: 'FEATURE',
        entityId: featureId,
        title: d.title,
        description: d.description ?? null,
        priority: d.priority ?? null,
        estimateDays: d.estimateDays ?? null,
        storyPoints: d.storyPoints ?? null,
        rank: i,
      })),
    });

    return this.listPending('FEATURE', featureId);
  }

  async generateForTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, description: true, priority: true },
    });
    if (!task) throw new AppError('Task not found.', 404);

    const existingSubtasks = await prisma.subtask.findMany({
      where: { taskId },
      select: { title: true },
    });

    const drafts: SuggestionDraft[] = await suggestionProvider.generateSubtaskSuggestions({
      taskTitle: task.title,
      taskDescription: task.description,
      taskPriority: task.priority,
      existingSubtaskTitles: existingSubtasks.map((s) => s.title),
    });

    if (drafts.length === 0) return [];

    await prisma.aiSuggestion.deleteMany({
      where: { entityType: 'TASK', entityId: taskId, status: 'PENDING' },
    });

    await prisma.aiSuggestion.createMany({
      data: drafts.map((d, i) => ({
        entityType: 'TASK',
        entityId: taskId,
        title: d.title,
        description: d.description ?? null,
        priority: d.priority ?? null,
        estimateDays: d.estimateDays ?? null,
        storyPoints: d.storyPoints ?? null,
        rank: i,
      })),
    });

    return this.listPending('TASK', taskId);
  }

  async listPending(entityType: 'FEATURE' | 'TASK', entityId: string) {
    return prisma.aiSuggestion.findMany({
      where: { entityType, entityId, status: 'PENDING' },
      orderBy: { rank: 'asc' },
    });
  }

  async accept(suggestionId: string, requesterId: string) {
    const suggestion = await prisma.aiSuggestion.findUnique({ where: { id: suggestionId } });
    if (!suggestion) throw new AppError('Suggestion not found.', 404);
    if (suggestion.status !== 'PENDING') throw new AppError('Suggestion is not pending.', 400);

    let createdEntity: any;

    if (suggestion.entityType === 'FEATURE') {
      createdEntity = await taskService.createTask(suggestion.entityId, {
        title: suggestion.title,
        description: suggestion.description ?? undefined,
        priority: suggestion.priority ?? undefined,
        estimateDays: suggestion.estimateDays ?? undefined,
        storyPoints: suggestion.storyPoints ?? undefined,
      }, requesterId);
    } else {
      createdEntity = await taskService.createSubtask(suggestion.entityId, {
        title: suggestion.title,
      }, requesterId);
    }

    await prisma.aiSuggestion.update({
      where: { id: suggestionId },
      data: { status: 'ACCEPTED' },
    });

    const nextSuggestion = await this.getNextPending(suggestion.entityType, suggestion.entityId, suggestion.rank);

    return { createdEntity, nextSuggestion };
  }

  async reject(suggestionId: string) {
    const suggestion = await prisma.aiSuggestion.findUnique({ where: { id: suggestionId } });
    if (!suggestion) throw new AppError('Suggestion not found.', 404);
    if (suggestion.status !== 'PENDING') throw new AppError('Suggestion is not pending.', 400);

    await prisma.aiSuggestion.update({
      where: { id: suggestionId },
      data: { status: 'REJECTED' },
    });

    const nextSuggestion = await this.getNextPending(suggestion.entityType, suggestion.entityId, suggestion.rank);

    return { nextSuggestion };
  }

  private async getNextPending(entityType: 'FEATURE' | 'TASK', entityId: string, afterRank: number) {
    return prisma.aiSuggestion.findFirst({
      where: { entityType, entityId, status: 'PENDING', rank: { gt: afterRank } },
      orderBy: { rank: 'asc' },
    });
  }
}

export const aiSuggestionService = new AiSuggestionService();
