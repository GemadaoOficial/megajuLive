import { Router, Request, Response } from 'express'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

interface TrackEventBody {
  liveId: string
  type: 'view' | 'purchase' | 'click' | 'share'
  productId?: string
  amount?: number
  sessionId?: string
  metadata?: Record<string, unknown>
}

// Track an analytics event (public - no auth required for tracking)
router.post('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const { liveId, type, productId, amount, sessionId, metadata } = req.body as TrackEventBody

    if (!liveId || !type) {
      res.status(400).json({ message: 'liveId e type sao obrigatorios' })
      return
    }

    const validTypes = ['view', 'purchase', 'click', 'share']
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: 'Tipo de evento invalido' })
      return
    }

    // Verify live exists
    const live = await prisma.live.findUnique({ where: { id: liveId } })
    if (!live) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    // Create event
    const event = await prisma.analyticsEvent.create({
      data: {
        liveId,
        type,
        productId,
        amount,
        sessionId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    // Update aggregated analytics in real-time
    await updateAggregatedAnalytics(liveId)

    res.status(201).json({ success: true, eventId: event.id })
  } catch (error) {
    console.error('Track event error:', error)
    res.status(500).json({ message: 'Erro ao registrar evento' })
  }
})

// Get analytics for a live (requires auth)
router.get('/live/:liveId', authenticate, async (req: Request<{ liveId: string }>, res: Response): Promise<void> => {
  try {
    const { liveId } = req.params

    // Verify user owns this live
    const live = await prisma.live.findFirst({
      where: {
        id: liveId,
        userId: req.user.id,
      },
      include: { analytics: true },
    })

    if (!live) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    // Get event counts by type
    const eventCounts = await prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { liveId },
      _count: { id: true },
    })

    // Get events timeline (last 24 hours grouped by hour)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentEvents = await prisma.analyticsEvent.findMany({
      where: {
        liveId,
        timestamp: { gte: oneDayAgo },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Group by hour for timeline
    const timeline = recentEvents.reduce((acc, event) => {
      const hour = new Date(event.timestamp).toISOString().slice(0, 13)
      if (!acc[hour]) {
        acc[hour] = { views: 0, purchases: 0, clicks: 0, shares: 0 }
      }
      if (event.type === 'view') acc[hour].views++
      if (event.type === 'purchase') acc[hour].purchases++
      if (event.type === 'click') acc[hour].clicks++
      if (event.type === 'share') acc[hour].shares++
      return acc
    }, {} as Record<string, { views: number; purchases: number; clicks: number; shares: number }>)

    // Get top products by clicks
    const topProducts = await prisma.analyticsEvent.groupBy({
      by: ['productId'],
      where: {
        liveId,
        type: 'click',
        productId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    res.json({
      analytics: live.analytics,
      eventCounts: eventCounts.reduce((acc, item) => {
        acc[item.type] = item._count.id
        return acc
      }, {} as Record<string, number>),
      timeline: Object.entries(timeline).map(([hour, data]) => ({
        hour,
        ...data,
      })),
      topProducts,
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Erro ao buscar analytics' })
  }
})

// Get dashboard summary (all lives analytics)
router.get('/dashboard', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id

    // Get all user's lives with analytics
    const lives = await prisma.live.findMany({
      where: { userId },
      include: { analytics: true },
    })

    // Calculate totals
    const totals = lives.reduce(
      (acc, live) => {
        if (live.analytics) {
          acc.totalViews += live.analytics.views
          acc.totalSales += live.analytics.sales
          acc.totalRevenue += live.analytics.revenue
        }
        return acc
      },
      { totalViews: 0, totalSales: 0, totalRevenue: 0 }
    )

    // Average conversion rate
    const analyticsWithData = lives.filter((l) => l.analytics && l.analytics.views > 0)
    const avgConversion =
      analyticsWithData.length > 0
        ? analyticsWithData.reduce((sum, l) => sum + (l.analytics?.conversion || 0), 0) /
          analyticsWithData.length
        : 0

    // Get recent events count (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const liveIds = lives.map((l) => l.id)

    const recentEventsCount =
      liveIds.length > 0
        ? await prisma.analyticsEvent.count({
            where: {
              liveId: { in: liveIds },
              timestamp: { gte: weekAgo },
            },
          })
        : 0

    res.json({
      totals: {
        ...totals,
        avgConversion: Math.round(avgConversion * 100) / 100,
      },
      livesCount: lives.length,
      recentEventsCount,
    })
  } catch (error) {
    console.error('Get dashboard analytics error:', error)
    res.status(500).json({ message: 'Erro ao buscar analytics do dashboard' })
  }
})

// Helper function to update aggregated analytics
async function updateAggregatedAnalytics(liveId: string): Promise<void> {
  // Count views
  const viewsCount = await prisma.analyticsEvent.count({
    where: { liveId, type: 'view' },
  })

  // Count and sum purchases
  const purchases = await prisma.analyticsEvent.findMany({
    where: { liveId, type: 'purchase' },
  })

  const salesCount = purchases.length
  const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)

  // Calculate conversion rate
  const conversion = viewsCount > 0 ? (salesCount / viewsCount) * 100 : 0

  // Upsert analytics
  await prisma.analytics.upsert({
    where: { liveId },
    update: {
      views: viewsCount,
      sales: salesCount,
      revenue: totalRevenue,
      conversion: Math.round(conversion * 100) / 100,
    },
    create: {
      liveId,
      views: viewsCount,
      sales: salesCount,
      revenue: totalRevenue,
      conversion: Math.round(conversion * 100) / 100,
    },
  })
}

export default router
