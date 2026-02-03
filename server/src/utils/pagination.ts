import { PaginationParams, PaginatedResponse } from '../types/index.js'

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page)) || DEFAULT_PAGE)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(query.limit)) || DEFAULT_LIMIT))
  const search = query.search ? String(query.search).trim() : undefined
  const status = query.status ? String(query.status) : undefined
  const sortBy = query.sortBy ? String(query.sortBy) : 'scheduledAt'
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

  return { page, limit, search, status, sortBy, sortOrder }
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = params
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}
