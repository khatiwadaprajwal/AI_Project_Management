import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export type DomainEventName =
  | 'feature.created'
  | 'feature.deleted'
  | 'feature.restored'
  | 'task.created'
  | 'task.statusChanged'
  | 'task.deleted'
  | 'task.restored'
  | 'task.assigned'
  | 'subtask.deleted';

export interface DomainEventPayload {
  entityType: 'PROJECT' | 'FEATURE' | 'TASK';
  entityId: string;
  actorId: string;
  action: string;
  meta?: Record<string, any>;
}

export const emitDomainEvent = (name: DomainEventName, payload: DomainEventPayload) => {
  eventBus.emit(name, payload);
};