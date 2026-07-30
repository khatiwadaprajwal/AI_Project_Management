export interface Feature {
  id: string
  projectId: string
  name: string
  order: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateFeatureInput {
  name: string
}

export interface UpdateFeatureInput {
  name?: string
}

export interface ReorderFeatureInput {
  order: number
}

export interface PaginatedFeatures {
  features: Feature[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
