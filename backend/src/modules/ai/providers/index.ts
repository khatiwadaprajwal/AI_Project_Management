import { env } from '../../../config/env';
import { suggestionProvider as gemini } from './geminiProvider';
import { groqProvider as groq } from './groqProvider';
import type { ISuggestionProvider, SuggestionDraft, FeatureContext, TaskContext } from './suggestionProvider.interface';

class FallbackProvider implements ISuggestionProvider {
  private providers: ISuggestionProvider[] = [];

  constructor() {
    if (env.GROQ_API_KEY) this.providers.push(groq);
    if (env.GEMINI_API_KEY) this.providers.push(gemini);
  }

  async generateTaskSuggestions(context: FeatureContext): Promise<SuggestionDraft[]> {
    for (const provider of this.providers) {
      try {
        const result = await provider.generateTaskSuggestions(context);
        if (result.length > 0) return result;
      } catch {
        continue;
      }
    }
    return [];
  }

  async generateSubtaskSuggestions(context: TaskContext): Promise<SuggestionDraft[]> {
    for (const provider of this.providers) {
      try {
        const result = await provider.generateSubtaskSuggestions(context);
        if (result.length > 0) return result;
      } catch {
        continue;
      }
    }
    return [];
  }
}

export const suggestionProvider: ISuggestionProvider = new FallbackProvider();
