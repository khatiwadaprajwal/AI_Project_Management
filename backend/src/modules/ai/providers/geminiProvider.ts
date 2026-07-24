import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { env } from '../../../config/env';
import type { ISuggestionProvider, SuggestionDraft, FeatureContext, TaskContext } from './suggestionProvider.interface';

const suggestionDraftSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  estimateDays: z.number().positive().optional(),
  storyPoints: z.number().int().positive().optional(),
});

const suggestionArraySchema = z.array(suggestionDraftSchema);

class GeminiProvider implements ISuggestionProvider {
  private model;

  constructor() {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      if (env.NODE_ENV === 'development') {
        console.warn('⚠️ GEMINI_API_KEY not set — AI suggestions will silently return empty.');
      }
      this.model = null as any;
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  private isAvailable(): boolean {
    return !!this.model && !!env.GEMINI_API_KEY;
  }

  private parseResponse(text: string): SuggestionDraft[] {
    try {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gm, '').trim();
      const parsed = JSON.parse(cleaned);
      const result = suggestionArraySchema.safeParse(parsed);
      if (!result.success) {
        console.error('AI suggestion parse failed:', result.error.format());
        console.error('Raw response:', text);
        return [];
      }
      return result.data;
    } catch (err) {
      console.error('AI suggestion parse error:', err);
      console.error('Raw response:', text);
      return [];
    }
  }

  async generateTaskSuggestions(context: FeatureContext): Promise<SuggestionDraft[]> {
    if (!this.isAvailable()) return [];

    const existing = context.existingTaskTitles.length
      ? `\nExisting tasks (avoid similar duplicates):\n${context.existingTaskTitles.map((t) => `- ${t}`).join('\n')}`
      : '';

    const prompt = `You are a product manager for a software team. Suggest ~6 candidate tasks for the feature "${context.featureName}" in project "${context.projectName}".${existing}

Return a JSON array of objects, each with:
- "title" (string, required)
- "description" (string, optional, 1-2 sentences)
- "priority" (string, optional: "LOW" | "MEDIUM" | "HIGH" | "URGENT")
- "estimateDays" (number, optional)
- "storyPoints" (integer, optional)

Return ONLY the JSON array, no other text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseResponse(text);
    } catch (err) {
      console.error('Gemini task suggestion error:', err);
      return [];
    }
  }

  async generateSubtaskSuggestions(context: TaskContext): Promise<SuggestionDraft[]> {
    if (!this.isAvailable()) return [];

    const existing = context.existingSubtaskTitles.length
      ? `\nExisting subtasks (avoid similar duplicates):\n${context.existingSubtaskTitles.map((t) => `- ${t}`).join('\n')}`
      : '';

    const prompt = `You are a developer breaking down a task. Suggest ~3-4 subtasks for the task "${context.taskTitle}" (${context.taskDescription || 'no description'}, priority: ${context.taskPriority}).${existing}

Return a JSON array of objects, each with:
- "title" (string, required)
- "description" (string, optional)
- "estimateDays" (number, optional)
- "storyPoints" (integer, optional)

Return ONLY the JSON array, no other text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseResponse(text);
    } catch (err) {
      console.error('Gemini subtask suggestion error:', err);
      return [];
    }
  }
}

export const suggestionProvider: ISuggestionProvider = new GeminiProvider();
