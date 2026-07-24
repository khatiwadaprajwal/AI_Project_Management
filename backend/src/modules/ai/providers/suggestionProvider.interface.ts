export interface SuggestionDraft {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimateDays?: number;
  storyPoints?: number;
}

export interface FeatureContext {
  projectName: string;
  featureName: string;
  existingTaskTitles: string[];
}

export interface TaskContext {
  taskTitle: string;
  taskDescription: string | null;
  taskPriority: string;
  existingSubtaskTitles: string[];
}

export interface ISuggestionProvider {
  generateTaskSuggestions(context: FeatureContext): Promise<SuggestionDraft[]>;
  generateSubtaskSuggestions(context: TaskContext): Promise<SuggestionDraft[]>;
}
