// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'COLABORADOR'
  avatar?: string
  createdAt: string
  updatedAt?: string
}

export type SafeUser = Omit<User, 'password'>

// Live types
export type LiveStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'

export interface Live {
  id: string
  title: string
  description?: string
  scheduledAt: string
  duration?: number
  status: LiveStatus
  userId: string
  products: Product[]
  analytics?: Analytics
  createdAt: string
  updatedAt: string
}

// Product types
export interface Product {
  id: string
  name: string
  price: number
  timeSlot: number
  liveId: string
}

// Analytics types
export interface Analytics {
  id: string
  liveId: string
  views: number
  sales: number
  revenue: number
  conversion: number
  createdAt: string
  updatedAt: string
}

// Tutorial types
export interface Tutorial {
  id: string
  title: string
  description?: string
  videoUrl?: string
  content?: string
  order: number
  createdAt: string
  updatedAt: string
}

// Pagination types
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// API response types
export interface LoginResponse {
  user: SafeUser
  accessToken: string
  refreshToken: string
}

export interface LivesResponse {
  lives: Live[]
}

export interface LiveResponse {
  live: Live
}

// Auth context types
export interface AuthContextType {
  user: SafeUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<SafeUser>
  register: (name: string, email: string, password: string) => Promise<SafeUser>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  updateUser: (userData: Partial<SafeUser>) => void
}

// Live filter params
export interface LiveFilterParams {
  page?: number
  limit?: number
  search?: string
  status?: LiveStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Admin stats
export interface AdminStats {
  totalUsers: number
  totalLives: number
  totalViews: number
  totalSales: number
  totalRevenue: number
}
