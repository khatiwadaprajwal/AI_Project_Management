export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getPaginationParams = (params: PaginationParams) => {
  const { page, limit } = params;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

export const buildPaginationMeta = (
  params: PaginationParams,
  total: number
): PaginationMeta => {
  const { page, limit } = params;
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};