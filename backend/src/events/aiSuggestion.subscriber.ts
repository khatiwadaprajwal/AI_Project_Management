import { eventBus, DomainEventPayload } from './eventBus';
import { aiSuggestionService } from '../modules/ai/aiSuggestion.service';

const handle = async (payload: DomainEventPayload) => {
  try {
    if (payload.entityType === 'FEATURE') {
      await aiSuggestionService.generateForFeature(payload.entityId);
    } else if (payload.entityType === 'TASK') {
      await aiSuggestionService.generateForTask(payload.entityId);
    }
  } catch (err) {
    // AI suggestion generation must never break the primary operation.
    console.error('Failed to generate AI suggestions:', err);
  }
};

export const registerAiSuggestionSubscriber = () => {
  eventBus.on('feature.created', handle);
  eventBus.on('task.created', handle);
};
