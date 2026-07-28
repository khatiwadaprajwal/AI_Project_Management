export interface AiSuggestion {
  id: string
  entityType: 'FEATURE' | 'TASK'
  entityId: string
  title: string
  description: string | null
  priority: string | null
  estimateDays: number | null
  storyPoints: number | null
  rank: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}
