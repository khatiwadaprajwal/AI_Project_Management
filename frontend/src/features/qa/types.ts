export interface QaReview {
  id: string
  taskId: string
  reviewerId: string
  result: 'PASS' | 'FAIL'
  note: string | null
  reviewedAt: string
}

export interface CreateQaReviewInput {
  result: 'PASS' | 'FAIL'
  note?: string
}
