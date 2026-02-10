import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  logoutAll: () => api.post('/auth/logout-all'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
}

export const livesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    return api.get(`/lives${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id) => api.get(`/lives/${id}`),
  create: (data) => api.post('/lives', data),
  update: (id, data) => api.put(`/lives/${id}`, data),
  delete: (id) => api.delete(`/lives/${id}`),
  start: (id) => api.post(`/lives/${id}/start`),
  end: (id) => api.post(`/lives/${id}/end`),
}

export const modulesAPI = {
  getAll: () => api.get('/modules'),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
}

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getLives: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    return api.get(`/admin/lives${queryString ? `?${queryString}` : ''}`)
  },
}

export const auditAPI = {
  getLogs: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    return api.get(`/audit${queryString ? `?${queryString}` : ''}`)
  },
  getMyActivity: (limit = 10) => api.get(`/audit/my-activity?limit=${limit}`),
  getStats: () => api.get('/audit/stats'),
  getById: (id) => api.get(`/audit/${id}`),
}

export const aiAPI = {
  suggestTitle: (data) => api.post('/ai/suggest-title', data),
  suggestDescription: (data) => api.post('/ai/suggest-description', data),
  extractLiveReport: (formData) => api.post('/ai/extract-live-report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  }),
}

export const analyticsHistoryAPI = {
  // Get summary for a period (7, 30, 90, 365 days)
  getSummary: (period = '30') => api.get(`/analytics-history/summary?period=${period}`),

  // Get snapshots for a date range
  getSnapshots: (startDate, endDate, period = 'daily') => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    params.append('period', period)
    return api.get(`/analytics-history/snapshots?${params.toString()}`)
  },

  // Get single snapshot by date
  getSnapshot: (date) => api.get(`/analytics-history/snapshot/${date}`),

  // Compare two dates
  compare: (date1, date2) => api.get(`/analytics-history/compare?date1=${date1}&date2=${date2}`),

  // Get available dates with data
  getAvailableDates: () => api.get('/analytics-history/available-dates'),

  // Generate snapshot (admin only)
  generateSnapshot: (date) => api.post('/analytics-history/snapshot/generate', { date }),

  // Seed historical data (admin only)
  seedData: (days = 90) => api.post('/analytics-history/snapshot/seed', { days }),
}

export const liveReportsAPI = {
  getSummary: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.append(key, String(value))
    })
    return api.get(`/live-reports/summary?${searchParams.toString()}`)
  },
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.append(key, String(value))
    })
    return api.get(`/live-reports?${searchParams.toString()}`)
  },
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.append(key, String(value))
    })
    return api.get(`/live-reports/products?${searchParams.toString()}`)
  },
  getById: (id) => api.get(`/live-reports/${id}`),
  create: (data) => api.post('/live-reports', data),
  update: (id, data) => api.put(`/live-reports/${id}`, data),
  delete: (id) => api.delete(`/live-reports/${id}`),
}

export const notesAPI = {
  getAll: () => api.get('/notes'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
}

export const settingsAPI = {
  getAll: () => api.get('/admin/settings'),
  get: (key) => api.get(`/admin/settings/${key}`),
  set: (key, data) => api.put(`/admin/settings/${key}`, data),
  delete: (key) => api.delete(`/admin/settings/${key}`),
  migrate: () => api.post('/admin/settings/migrate'),
  reload: () => api.post('/admin/settings/reload'),
}
