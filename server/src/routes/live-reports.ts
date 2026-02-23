import { Router, Request, Response } from 'express'
import { Prisma } from '../generated/prisma/client.js'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination.js'
import { createAuditLog } from './audit.js'
import { getDateRange } from '../utils/reportHelpers.js'
import '../types/index.js'

// Sub-routers
import summaryRouter from './live-reports/summary.js'
import productsRouter from './live-reports/products.js'
import aiRouter from './live-reports/ai.js'

const router = Router()

router.use(authenticate)

// Mount sub-routers
router.use('/', summaryRouter)   // /summary, /export-excel
router.use('/', productsRouter)  // /products, /products/top, /products/ai-dedup, /products/undo-dedup
router.use('/', aiRouter)        // /ai-insights

// Sanitize traffic sources array
function sanitizeTrafficSources(raw: any): any[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item: any) => item && typeof item.source === 'string' && item.source.trim())
    .map((item: any) => ({
      source: String(item.source).trim().slice(0, 100),
      trafficRate: parseFloat(item.trafficRate) || 0,
      pageViews: parseInt(item.pageViews) || 0,
    }))
    .slice(0, 20)
}

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
    funnelClickRate: parseFloat(body.funnelClickRate) || 0,
    funnelProductClicks: parseInt(body.funnelProductClicks) || 0,
    orderRate: parseFloat(body.orderRate) || 0,
    funnelOrders: parseInt(body.funnelOrders) || 0,
    impressionToOrderRate: parseFloat(body.impressionToOrderRate) || 0,
    trafficSources: sanitizeTrafficSources(body.trafficSources),
    createdManually: !!body.createdManually,
    aiAnalyzed: !!body.aiAnalyzed,
  }
}

// GET /api/live-reports - List all reports with pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit, search, sortBy, sortOrder } = params
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

    // Dynamic sorting
    const validSortFields = ['reportDate', 'totalRevenue', 'totalOrders', 'totalViewers',
      'engagedViewers', 'totalComments', 'addToCart', 'liveDuration', 'coinsUsed']
    const orderField = (sortBy && validSortFields.includes(sortBy)) ? sortBy : 'reportDate'

    const [reports, total] = await Promise.all([
      prisma.liveReport.findMany({
        where,
        include: { liveProducts: true, live: { select: { title: true, status: true } } },
        orderBy: { [orderField]: sortOrder },
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
            canonicalName: p.canonicalName || null,
            price: Math.max(0, parseFloat(p.price) || 0),
            productClicks: Math.max(0, parseInt(p.productClicks) || 0),
            clickRate: Math.max(0, parseFloat(p.clickRate) || 0),
            orders: Math.max(0, parseInt(p.orders) || 0),
            itemsSold: Math.max(0, parseInt(p.itemsSold) || 0),
            orderClickRate: Math.max(0, parseFloat(p.orderClickRate) || 0),
            addToCart: Math.max(0, parseInt(p.addToCart) || 0),
            revenue: Math.max(0, parseFloat(p.revenue) || 0),
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
            canonicalName: p.canonicalName || null,
            price: Math.max(0, parseFloat(p.price) || 0),
            productClicks: Math.max(0, parseInt(p.productClicks) || 0),
            clickRate: Math.max(0, parseFloat(p.clickRate) || 0),
            orders: Math.max(0, parseInt(p.orders) || 0),
            itemsSold: Math.max(0, parseInt(p.itemsSold) || 0),
            orderClickRate: Math.max(0, parseFloat(p.orderClickRate) || 0),
            addToCart: Math.max(0, parseInt(p.addToCart) || 0),
            revenue: Math.max(0, parseFloat(p.revenue) || 0),
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
