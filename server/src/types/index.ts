import { User, Live, Product, Analytics, Tutorial } from '../generated/prisma/client.js'

// User without password
export type SafeUser = Omit<User, 'password'>

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: SafeUser
    }
  }
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Token types
export interface TokenPayload {
  userId: string
  type?: 'access' | 'refresh'
}

// Live with relations
export type LiveWithRelations = Live & {
  products: Product[]
  analytics: Analytics | null
}

// Re-export Prisma types for convenience
export type { User, Live, Product, Analytics, Tutorial }
