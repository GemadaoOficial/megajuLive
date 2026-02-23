import { Router, Request, Response } from 'express'
import prisma from '../utils/prisma.js'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Helper function to get start of day
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper function to get start of month
function startOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper function to get start of year
function startOfYear(date: Date): Date {
  const d = new Date(date)
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper function to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Generate daily snapshot (should be called via cron job or manually)
router.post('/snapshot/generate', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date: dateStr } = req.body
    const targetDate = dateStr ? startOfDay(new Date(dateStr)) : startOfDay(new Date())

    // Check if snapshot already exists for this date
    const existingSnapshot = await prisma.analyticsSnapshot.findUnique({
      where: { date: targetDate },
    })

    if (existingSnapshot) {
      res.status(400).json({ message: 'Snapshot já existe para esta data' })
      return
    }

    // Get previous day snapshot for growth calculation
    const previousDate = new Date(targetDate)
    previousDate.setDate(previousDate.getDate() - 1)
    const previousSnapshot = await prisma.analyticsSnapshot.findUnique({
      where: { date: previousDate },
    })

    // Calculate metrics from AnalyticsEvent for the target date
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const [views, shares, purchases, liveReports] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { type: 'view', timestamp: { gte: targetDate, lt: nextDay } },
      }),
      prisma.analyticsEvent.count({
        where: { type: 'share', timestamp: { gte: targetDate, lt: nextDay } },
      }),
      prisma.analyticsEvent.findMany({
        where: { type: 'purchase', timestamp: { gte: targetDate, lt: nextDay } },
      }),
      prisma.liveReport.findMany({
        where: { reportDate: { gte: targetDate, lt: nextDay } },
        select: { totalLikes: true, totalComments: true },
      }),
    ])

    // Likes and comments come from LiveReport, not AnalyticsEvent
    const likes = liveReports.reduce((sum, r) => sum + (r.totalLikes || 0), 0)
    const comments = liveReports.reduce((sum, r) => sum + (r.totalComments || 0), 0)

    // Get lives data
    const [totalLives, completedLives] = await Promise.all([
      prisma.live.count({
        where: { createdAt: { gte: targetDate, lt: nextDay } },
      }),
      prisma.live.count({
        where: { status: 'COMPLETED', updatedAt: { gte: targetDate, lt: nextDay } },
      }),
    ])

    // Get total followers (users count as proxy)
    const totalFollowers = await prisma.user.count()
    const newFollowers = await prisma.user.count({
      where: { createdAt: { gte: targetDate, lt: nextDay } },
    })

    // Calculate revenue
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalSales = purchases.length
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
    const conversionRate = views > 0 ? (totalSales / views) * 100 : 0
    const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0

    // Calculate growth
    const viewsGrowth = calculateGrowth(views, previousSnapshot?.totalViews || 0)
    const followersGrowth = calculateGrowth(newFollowers, previousSnapshot?.newFollowers || 0)
    const salesGrowth = calculateGrowth(totalSales, previousSnapshot?.totalSales || 0)
    const revenueGrowth = calculateGrowth(totalRevenue, previousSnapshot?.totalRevenue || 0)
    const engagementGrowth = calculateGrowth(engagementRate, previousSnapshot?.engagementRate || 0)

    // Create snapshot
    const snapshot = await prisma.analyticsSnapshot.create({
      data: {
        date: targetDate,
        period: 'daily',
        totalViews: views,
        totalLikes: likes,
        totalComments: comments,
        totalShares: shares,
        totalFollowers,
        newFollowers,
        engagementRate,
        avgWatchTime: 0,
        totalSales,
        totalRevenue,
        avgOrderValue,
        conversionRate,
        totalLives,
        completedLives,
        avgViewersPerLive: totalLives > 0 ? views / totalLives : 0,
        peakViewers: views,
        totalProducts: await prisma.product.count(),
        viewsGrowth,
        followersGrowth,
        salesGrowth,
        revenueGrowth,
        engagementGrowth,
      },
    })

    res.status(201).json({ snapshot })
  } catch (error) {
    console.error('Generate snapshot error:', error)
    res.status(500).json({ message: 'Erro ao gerar snapshot' })
  }
})

// Seed sample historical data (for demonstration)
router.post('/snapshot/seed', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 90 } = req.body
    const snapshots = []

    let followers = 5000
    let views = 10000
    let likes = 15000
    let comments = 2000
    let shares = 800
    let sales = 200
    let revenue = 30000

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const targetDate = startOfDay(date)

      // Check if exists
      const exists = await prisma.analyticsSnapshot.findUnique({
        where: { date: targetDate },
      })

      if (!exists) {
        // Add random variation
        const viewsVariation = Math.floor(Math.random() * 500) - 200
        const likesVariation = Math.floor(Math.random() * 300) - 100
        const commentsVariation = Math.floor(Math.random() * 100) - 50
        const sharesVariation = Math.floor(Math.random() * 50) - 20
        const salesVariation = Math.floor(Math.random() * 30) - 10
        const revenueVariation = Math.floor(Math.random() * 2000) - 500
        const followersGain = Math.floor(Math.random() * 50) + 10

        views = Math.max(100, views + viewsVariation)
        likes = Math.max(50, likes + likesVariation)
        comments = Math.max(10, comments + commentsVariation)
        shares = Math.max(5, shares + sharesVariation)
        sales = Math.max(5, sales + salesVariation)
        revenue = Math.max(500, revenue + revenueVariation)
        followers += followersGain

        const snapshot = await prisma.analyticsSnapshot.create({
          data: {
            date: targetDate,
            period: 'daily',
            totalViews: views,
            totalLikes: likes,
            totalComments: comments,
            totalShares: shares,
            totalFollowers: followers,
            newFollowers: followersGain,
            engagementRate: ((likes + comments + shares) / views) * 100,
            avgWatchTime: Math.floor(Math.random() * 600) + 300,
            totalSales: sales,
            totalRevenue: revenue,
            avgOrderValue: sales > 0 ? revenue / sales : 0,
            conversionRate: views > 0 ? (sales / views) * 100 : 0,
            totalLives: Math.floor(Math.random() * 5) + 1,
            completedLives: Math.floor(Math.random() * 4) + 1,
            avgViewersPerLive: views / (Math.floor(Math.random() * 5) + 1),
            peakViewers: Math.floor(views * 1.5),
            totalProducts: Math.floor(Math.random() * 20) + 10,
            viewsGrowth: (Math.random() - 0.3) * 20,
            followersGrowth: (Math.random() - 0.3) * 15,
            salesGrowth: (Math.random() - 0.3) * 25,
            revenueGrowth: (Math.random() - 0.3) * 30,
            engagementGrowth: (Math.random() - 0.3) * 10,
          },
        })
        snapshots.push(snapshot)
      }
    }

    res.json({ message: `Criados ${snapshots.length} snapshots históricos`, count: snapshots.length })
  } catch (error) {
    console.error('Seed snapshots error:', error)
    res.status(500).json({ message: 'Erro ao criar dados históricos' })
  }
})

// Get snapshots for a date range
router.get('/snapshots', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query

    const where: any = { period: period as string }
    const dateFilter: any = {}

    if (startDate) {
      dateFilter.gte = startOfDay(new Date(startDate as string))
    }
    if (endDate) {
      const end = new Date(endDate as string)
      end.setDate(end.getDate() + 1)
      dateFilter.lt = startOfDay(end)
    }
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter
    }

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    res.json({ snapshots })
  } catch (error) {
    console.error('Get snapshots error:', error)
    res.status(500).json({ message: 'Erro ao buscar snapshots' })
  }
})

// Get single snapshot by date
router.get('/snapshot/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const date = req.params.date as string
    const targetDate = startOfDay(new Date(date))

    const snapshot = await prisma.analyticsSnapshot.findUnique({
      where: { date: targetDate },
    })

    if (!snapshot) {
      res.status(404).json({ message: 'Snapshot não encontrado' })
      return
    }

    res.json({ snapshot })
  } catch (error) {
    console.error('Get snapshot error:', error)
    res.status(500).json({ message: 'Erro ao buscar snapshot' })
  }
})

// Compare two dates
router.get('/compare', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date1, date2 } = req.query

    if (!date1 || !date2) {
      res.status(400).json({ message: 'Duas datas são necessárias para comparação' })
      return
    }

    const snapshot1 = await prisma.analyticsSnapshot.findUnique({
      where: { date: startOfDay(new Date(date1 as string)) },
    })

    const snapshot2 = await prisma.analyticsSnapshot.findUnique({
      where: { date: startOfDay(new Date(date2 as string)) },
    })

    if (!snapshot1 || !snapshot2) {
      res.status(404).json({ message: 'Um ou ambos os snapshots não foram encontrados' })
      return
    }

    const comparison = {
      date1: { date: snapshot1.date, data: snapshot1 },
      date2: { date: snapshot2.date, data: snapshot2 },
      differences: {
        views: {
          value: snapshot2.totalViews - snapshot1.totalViews,
          percentage: calculateGrowth(snapshot2.totalViews, snapshot1.totalViews),
        },
        likes: {
          value: snapshot2.totalLikes - snapshot1.totalLikes,
          percentage: calculateGrowth(snapshot2.totalLikes, snapshot1.totalLikes),
        },
        comments: {
          value: snapshot2.totalComments - snapshot1.totalComments,
          percentage: calculateGrowth(snapshot2.totalComments, snapshot1.totalComments),
        },
        shares: {
          value: snapshot2.totalShares - snapshot1.totalShares,
          percentage: calculateGrowth(snapshot2.totalShares, snapshot1.totalShares),
        },
        followers: {
          value: snapshot2.totalFollowers - snapshot1.totalFollowers,
          percentage: calculateGrowth(snapshot2.totalFollowers, snapshot1.totalFollowers),
        },
        sales: {
          value: snapshot2.totalSales - snapshot1.totalSales,
          percentage: calculateGrowth(snapshot2.totalSales, snapshot1.totalSales),
        },
        revenue: {
          value: snapshot2.totalRevenue - snapshot1.totalRevenue,
          percentage: calculateGrowth(snapshot2.totalRevenue, snapshot1.totalRevenue),
        },
        engagementRate: {
          value: snapshot2.engagementRate - snapshot1.engagementRate,
          percentage: calculateGrowth(snapshot2.engagementRate, snapshot1.engagementRate),
        },
      },
    }

    res.json({ comparison })
  } catch (error) {
    console.error('Compare snapshots error:', error)
    res.status(500).json({ message: 'Erro ao comparar snapshots' })
  }
})

// Get available dates with data
router.get('/available-dates', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshots = await prisma.analyticsSnapshot.findMany({
      select: { date: true },
      orderBy: { date: 'desc' },
    })

    const dates = snapshots.map((s) => s.date.toISOString().split('T')[0])

    res.json({ dates })
  } catch (error) {
    console.error('Get available dates error:', error)
    res.status(500).json({ message: 'Erro ao buscar datas disponíveis' })
  }
})

// Get summary statistics
router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period as string)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { date: { gte: startOfDay(startDate) } },
      orderBy: { date: 'asc' },
    })

    if (snapshots.length === 0) {
      res.json({
        summary: {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalFollowers: 0,
          totalSales: 0,
          totalRevenue: 0,
          avgEngagementRate: 0,
          avgWatchTime: 0,
          dataPoints: 0,
        },
      })
      return
    }

    const latest = snapshots[snapshots.length - 1]
    const first = snapshots[0]

    const summary = {
      totalViews: snapshots.reduce((sum, s) => sum + s.totalViews, 0),
      totalLikes: snapshots.reduce((sum, s) => sum + s.totalLikes, 0),
      totalComments: snapshots.reduce((sum, s) => sum + s.totalComments, 0),
      totalShares: snapshots.reduce((sum, s) => sum + s.totalShares, 0),
      totalFollowers: latest.totalFollowers,
      followersGained: latest.totalFollowers - first.totalFollowers,
      totalSales: snapshots.reduce((sum, s) => sum + s.totalSales, 0),
      totalRevenue: snapshots.reduce((sum, s) => sum + s.totalRevenue, 0),
      avgEngagementRate: snapshots.reduce((sum, s) => sum + s.engagementRate, 0) / snapshots.length,
      avgWatchTime: snapshots.reduce((sum, s) => sum + s.avgWatchTime, 0) / snapshots.length,
      avgViewsPerDay: snapshots.reduce((sum, s) => sum + s.totalViews, 0) / snapshots.length,
      avgSalesPerDay: snapshots.reduce((sum, s) => sum + s.totalSales, 0) / snapshots.length,
      avgRevenuePerDay: snapshots.reduce((sum, s) => sum + s.totalRevenue, 0) / snapshots.length,
      dataPoints: snapshots.length,
      chartData: snapshots.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        views: s.totalViews,
        likes: s.totalLikes,
        comments: s.totalComments,
        shares: s.totalShares,
        followers: s.totalFollowers,
        newFollowers: s.newFollowers,
        sales: s.totalSales,
        revenue: s.totalRevenue,
        engagementRate: s.engagementRate,
      })),
    }

    res.json({ summary })
  } catch (error) {
    console.error('Get summary error:', error)
    res.status(500).json({ message: 'Erro ao buscar resumo' })
  }
})

export default router
