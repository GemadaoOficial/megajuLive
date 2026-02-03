import { useCallback, useRef } from 'react'
import api from '../services/api'

// Generate a unique session ID for tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

export function useAnalytics(liveId) {
  const trackedViews = useRef(new Set())

  const trackEvent = useCallback(
    async (type, data = {}) => {
      if (!liveId) return

      try {
        await api.post('/analytics/track', {
          liveId,
          type,
          sessionId: getSessionId(),
          ...data,
        })
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.warn('Analytics tracking failed:', error)
      }
    },
    [liveId]
  )

  const trackView = useCallback(() => {
    // Only track one view per session per live
    const key = `${liveId}-view`
    if (trackedViews.current.has(key)) return

    trackedViews.current.add(key)
    trackEvent('view')
  }, [liveId, trackEvent])

  const trackClick = useCallback(
    (productId, metadata = {}) => {
      trackEvent('click', { productId, metadata })
    },
    [trackEvent]
  )

  const trackPurchase = useCallback(
    (productId, amount, metadata = {}) => {
      trackEvent('purchase', { productId, amount, metadata })
    },
    [trackEvent]
  )

  const trackShare = useCallback(
    (platform, metadata = {}) => {
      trackEvent('share', { metadata: { platform, ...metadata } })
    },
    [trackEvent]
  )

  return {
    trackView,
    trackClick,
    trackPurchase,
    trackShare,
    trackEvent,
  }
}

// Hook to fetch analytics data
export function useAnalyticsData() {
  const fetchLiveAnalytics = useCallback(async (liveId) => {
    try {
      const response = await api.get(`/analytics/live/${liveId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch live analytics:', error)
      throw error
    }
  }, [])

  const fetchDashboardAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      return response.data
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error)
      throw error
    }
  }, [])

  return {
    fetchLiveAnalytics,
    fetchDashboardAnalytics,
  }
}

export default useAnalytics
