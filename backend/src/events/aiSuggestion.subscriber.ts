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

    console.error('Failed to generate AI suggestions:', err);
  }
};

export const registerAiSuggestionSubscriber = () => {
  eventBus.on('feature.created', handle);
  eventBus.on('task.created', handle);
};
