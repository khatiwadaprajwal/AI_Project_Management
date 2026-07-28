export interface Feature {
  id: string
  projectId: string
  name: string
  order: number
  deletedAt: string | null
  deletedBy: string | null
  deleteReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateFeatureInput {
  name: string
}

export interface UpdateFeatureInput {
  name?: string
}

export interface FeatureListResponse {
  features: Feature[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
