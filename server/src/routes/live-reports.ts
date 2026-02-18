import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination.js'
import { createAuditLog } from './audit.js'
import '../types/index.js'

const router = Router()

router.use(authenticate)

// Helper to parse date range from query
function getDateRange(query: Record<string, string | undefined>) {
  const { period, startDate, endDate } = query
  const now = new Date()
  let start: Date | undefined
  let end: Date | undefined

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      break
    case 'yesterday': {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate())
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999)
      break
    }
    case '7d':
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      end = now
      break
    case '30d':
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      end = now
      break
    case 'custom':
      if (startDate) start = new Date(startDate)
      if (endDate) end = new Date(endDate)
      break
    default:
      // All time - no filter
      break
  }

  return { start, end }
}

// GET /api/live-reports/summary - Aggregated overview
router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = getDateRange(req.query as Record<string, string>)
    const store = (req.query as any).store as string | undefined

    const where: Prisma.LiveReportWhereInput = {
      userId: req.user.id,
      ...(start || end ? {
        reportDate: {
          ...(start && { gte: start }),
          ...(end && { lte: end }),
        },
      } : {}),
      ...(store && { store }),
    }

    const reports = await prisma.liveReport.findMany({
      where,
      include: { liveProducts: true },
    })

    const count = reports.length
    if (count === 0) {
      res.json({ summary: null, count: 0 })
      return
    }

    const summary = {
      // Transação
      totalRevenue: reports.reduce((s, r) => s + r.totalRevenue, 0),
      totalOrders: reports.reduce((s, r) => s + r.totalOrders, 0),
      totalItemsSold: reports.reduce((s, r) => s + r.totalItemsSold, 0),
      avgOrderValue: 0,
      avgRevenuePerBuyer: 0,

      // Tráfego
      totalViewers: reports.reduce((s, r) => s + r.totalViewers, 0),
      engagedViewers: reports.reduce((s, r) => s + r.engagedViewers, 0),
      totalViews: reports.reduce((s, r) => s + r.totalViews, 0),
      peakViewers: Math.max(...reports.map(r => r.peakViewers)),
      avgWatchTime: Math.round(reports.reduce((s, r) => s + r.avgWatchTime, 0) / count),
      totalLiveDuration: reports.reduce((s, r) => s + r.liveDuration, 0),
      avgLiveDuration: Math.round(reports.reduce((s, r) => s + r.liveDuration, 0) / count),

      // Conversão
      avgClickRate: reports.reduce((s, r) => s + r.clickRate, 0) / count,
      totalBuyers: reports.reduce((s, r) => s + r.totalBuyers, 0),
      totalProductClicks: reports.reduce((s, r) => s + r.productClicks, 0),
      avgProductClickRate: reports.reduce((s, r) => s + r.productClickRate, 0) / count,
      avgConversionRate: reports.reduce((s, r) => s + r.conversionRate, 0) / count,
      totalAddToCart: reports.reduce((s, r) => s + r.addToCart, 0),
      avgGpm: reports.reduce((s, r) => s + r.gpm, 0) / count,

      // Engajamento
      totalLikes: reports.reduce((s, r) => s + r.totalLikes, 0),
      totalShares: reports.reduce((s, r) => s + r.totalShares, 0),
      totalComments: reports.reduce((s, r) => s + r.totalComments, 0),
      avgCommentRate: reports.reduce((s, r) => s + r.commentRate, 0) / count,
      totalNewFollowers: reports.reduce((s, r) => s + r.newFollowers, 0),

      // Marketing
      totalCouponsUsed: reports.reduce((s, r) => s + r.couponsUsed, 0),
      totalCoinsUsed: reports.reduce((s, r) => s + r.coinsUsed, 0),
      totalCoinsCost: reports.reduce((s, r) => s + r.coinsCost, 0),

      // Meta
      livesCount: count,
    }

    // Calculated averages
    summary.avgOrderValue = summary.totalOrders > 0
      ? summary.totalRevenue / summary.totalOrders : 0
    summary.avgRevenuePerBuyer = summary.totalBuyers > 0
      ? summary.totalRevenue / summary.totalBuyers : 0

    res.json({ summary, count })
  } catch (error) {
    console.error('Get report summary error:', error)
    res.status(500).json({ message: 'Erro ao buscar resumo' })
  }
})

// GET /api/live-reports/products - Aggregated product list
router.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit } = params
    const { start, end } = getDateRange(req.query as Record<string, string>)

    const reportWhere: Prisma.LiveReportWhereInput = {
      userId: req.user.id,
      ...(start || end ? {
        reportDate: {
          ...(start && { gte: start }),
          ...(end && { lte: end }),
        },
      } : {}),
    }

    // Get all products from reports in range
    const allProducts = await prisma.liveProduct.findMany({
      where: {
        liveReport: reportWhere,
      },
      orderBy: { revenue: 'desc' },
    })

    // Aggregate by normalized name (first 40 alphanum chars, lowercase)
    // AI often extracts slightly different shopeeItemIds for the same product
    const normalizeName = (name: string) =>
      name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').substring(0, 40)

    const productMap = new Map<string, {
      name: string
      shopeeItemId: string | null
      productClicks: number
      addToCart: number
      orders: number
      itemsSold: number
      revenue: number
      appearances: number
    }>()

    for (const p of allProducts) {
      const key = normalizeName(p.name)
      const existing = productMap.get(key)
      if (existing) {
        existing.productClicks += p.productClicks
        existing.addToCart += p.addToCart
        existing.orders += p.orders
        existing.itemsSold += p.itemsSold
        existing.revenue += p.revenue
        existing.appearances++
      } else {
        productMap.set(key, {
          name: p.name,
          shopeeItemId: p.shopeeItemId,
          productClicks: p.productClicks,
          addToCart: p.addToCart,
          orders: p.orders,
          itemsSold: p.itemsSold,
          revenue: p.revenue,
          appearances: 1,
        })
      }
    }

    const aggregated = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)

    const total = aggregated.length
    const paginated = aggregated.slice((page - 1) * limit, page * limit)

    res.json(buildPaginatedResponse(paginated, total, params))
  } catch (error) {
    console.error('Get report products error:', error)
    res.status(500).json({ message: 'Erro ao buscar produtos' })
  }
})

// GET /api/live-reports - List all reports with pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit, search, sortOrder } = params
    const { start, end } = getDateRange(req.query as Record<string, string>)
    const store = (req.query as any).store as string | undefined

    const where: Prisma.LiveReportWhereInput = {
      userId: req.user.id,
      ...(start || end ? {
        reportDate: {
          ...(start && { gte: start }),
          ...(end && { lte: end }),
        },
      } : {}),
      ...(search && {
        liveTitle: { contains: search },
      }),
      ...(store && { store }),
    }

    const [reports, total] = await Promise.all([
      prisma.liveReport.findMany({
        where,
        include: { liveProducts: true, live: { select: { title: true, status: true } } },
        orderBy: { reportDate: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.liveReport.count({ where }),
    ])

    res.json(buildPaginatedResponse(reports, total, params))
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ message: 'Erro ao buscar relatórios' })
  }
})

// GET /api/live-reports/:id - Get report detail
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const report = await prisma.liveReport.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { liveProducts: true, live: true },
    })

    if (!report) {
      res.status(404).json({ message: 'Relatório não encontrado' })
      return
    }

    res.json({ report })
  } catch (error) {
    console.error('Get report error:', error)
    res.status(500).json({ message: 'Erro ao buscar relatório' })
  }
})

// Whitelist of allowed fields to prevent injection
function sanitizeReportData(body: any) {
  return {
    liveTitle: body.liveTitle || '',
    store: body.store || '',
    totalRevenue: parseFloat(body.totalRevenue) || 0,
    totalOrders: parseInt(body.totalOrders) || 0,
    totalItemsSold: parseInt(body.totalItemsSold) || 0,
    avgOrderValue: parseFloat(body.avgOrderValue) || 0,
    avgRevenuePerBuyer: parseFloat(body.avgRevenuePerBuyer) || 0,
    totalViewers: parseInt(body.totalViewers) || 0,
    engagedViewers: parseInt(body.engagedViewers) || 0,
    totalViews: parseInt(body.totalViews) || 0,
    peakViewers: parseInt(body.peakViewers) || 0,
    avgWatchTime: parseInt(body.avgWatchTime) || 0,
    liveDuration: parseInt(body.liveDuration) || 0,
    clickRate: parseFloat(body.clickRate) || 0,
    totalBuyers: parseInt(body.totalBuyers) || 0,
    productClicks: parseInt(body.productClicks) || 0,
    productClickRate: parseFloat(body.productClickRate) || 0,
    conversionRate: parseFloat(body.conversionRate) || 0,
    addToCart: parseInt(body.addToCart) || 0,
    gpm: parseFloat(body.gpm) || 0,
    totalLikes: parseInt(body.totalLikes) || 0,
    totalShares: parseInt(body.totalShares) || 0,
    totalComments: parseInt(body.totalComments) || 0,
    commentRate: parseFloat(body.commentRate) || 0,
    newFollowers: parseInt(body.newFollowers) || 0,
    couponsUsed: parseInt(body.couponsUsed) || 0,
    coinsUsed: parseFloat(body.coinsUsed) || 0,
    coinsCost: parseFloat(body.coinsCost) || 0,
    coinRedemptions: parseInt(body.coinRedemptions) || 0,
    auctionRounds: parseInt(body.auctionRounds) || 0,
    productImpressions: parseInt(body.productImpressions) || 0,
    orderRate: parseFloat(body.orderRate) || 0,
    impressionToOrderRate: parseFloat(body.impressionToOrderRate) || 0,
    createdManually: !!body.createdManually,
    aiAnalyzed: !!body.aiAnalyzed,
  }
}

// POST /api/live-reports - Create report
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { liveId, products, reportDate } = req.body
    const data = sanitizeReportData(req.body)

    const report = await prisma.liveReport.create({
      data: {
        ...data,
        liveId: liveId || null,
        userId: req.user.id,
        reportDate: new Date(reportDate),
        liveProducts: products && products.length > 0 ? {
          create: products.map((p: any) => ({
            name: p.name || '',
            price: parseFloat(p.price) || 0,
            productClicks: parseInt(p.productClicks) || 0,
            clickRate: parseFloat(p.clickRate) || 0,
            orders: parseInt(p.orders) || 0,
            itemsSold: parseInt(p.itemsSold) || 0,
            orderClickRate: parseFloat(p.orderClickRate) || 0,
            addToCart: parseInt(p.addToCart) || 0,
            revenue: parseFloat(p.revenue) || 0,
            shopeeItemId: p.shopeeItemId || null,
            imageUrl: p.imageUrl || null,
          })),
        } : undefined,
      },
      include: { liveProducts: true },
    })

    // If linked to a live, also update its status
    if (liveId) {
      await prisma.live.update({
        where: { id: liveId },
        data: { status: 'COMPLETED' },
      }).catch(() => {})
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'LIVE',
      entityId: report.id,
      details: { title: report.liveTitle, type: 'report' },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ report })
  } catch (error) {
    console.error('Create report error:', error)
    res.status(500).json({ message: 'Erro ao criar relatório' })
  }
})

// PUT /api/live-reports/:id - Update report
router.put('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const existing = await prisma.liveReport.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      res.status(404).json({ message: 'Relatório não encontrado' })
      return
    }

    const { products, reportDate } = req.body
    const data = sanitizeReportData(req.body)

    // Delete old products and recreate only when new products are provided
    if (products && products.length > 0) {
      await prisma.liveProduct.deleteMany({
        where: { liveReportId: req.params.id },
      })
    }

    const report = await prisma.liveReport.update({
      where: { id: req.params.id },
      data: {
        ...data,
        reportDate: reportDate ? new Date(reportDate) : undefined,
        liveProducts: products && products.length > 0 ? {
          create: products.map((p: any) => ({
            name: p.name || '',
            price: parseFloat(p.price) || 0,
            productClicks: parseInt(p.productClicks) || 0,
            clickRate: parseFloat(p.clickRate) || 0,
            orders: parseInt(p.orders) || 0,
            itemsSold: parseInt(p.itemsSold) || 0,
            orderClickRate: parseFloat(p.orderClickRate) || 0,
            addToCart: parseInt(p.addToCart) || 0,
            revenue: parseFloat(p.revenue) || 0,
            shopeeItemId: p.shopeeItemId || null,
            imageUrl: p.imageUrl || null,
          })),
        } : undefined,
      },
      include: { liveProducts: true },
    })

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'LIVE',
      entityId: report.id,
      details: { title: report.liveTitle, type: 'report' },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ report })
  } catch (error) {
    console.error('Update report error:', error)
    res.status(500).json({ message: 'Erro ao atualizar relatório' })
  }
})

// DELETE /api/live-reports/:id
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const existing = await prisma.liveReport.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      res.status(404).json({ message: 'Relatório não encontrado' })
      return
    }

    await prisma.liveReport.delete({ where: { id: req.params.id } })

    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'LIVE',
      entityId: req.params.id,
      details: { title: existing.liveTitle, type: 'report' },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Relatório excluído com sucesso' })
  } catch (error) {
    console.error('Delete report error:', error)
    res.status(500).json({ message: 'Erro ao excluir relatório' })
  }
})

export default router
