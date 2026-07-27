import { eventBus, DomainEventPayload } from './eventBus';
import prisma from '../config/db';

const handle = async (payload: DomainEventPayload) => {
  try {
    await prisma.activityLog.create({
      data: {
        entityType: payload.entityType,
        entityId: payload.entityId,
        actorId: payload.actorId,
        action: payload.action,
        meta: payload.meta,
      },
    });
  } catch (err) {
    // Activity logging must never break the primary operation.
    console.error('Failed to write activity log:', err);
  }
};

export const registerActivityLogSubscriber = () => {
  const events: string[] = [
    'feature.created',
    'feature.deleted',
    'feature.restored',
    'project.deleted',
    'project.restored',
    'task.created',
    'task.statusChanged',
    'task.deleted',
    'task.restored',
    'task.assigned',
    'subtask.deleted',
    'qa.reviewed',
  ];

  events.forEach((eventName) => {
    eventBus.on(eventName, handle);
  });
};