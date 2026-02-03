import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination.js'
import { createAuditLog } from './audit.js'
import '../types/index.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get all lives for current user with pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit, search, status, sortBy, sortOrder } = params

    const where: Prisma.LiveWhereInput = {
      userId: req.user.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    }

    const [lives, total] = await Promise.all([
      prisma.live.findMany({
        where,
        include: { products: true, analytics: true },
        orderBy: { [sortBy!]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.live.count({ where }),
    ])

    res.json(buildPaginatedResponse(lives, total, params))
  } catch (error) {
    console.error('Get lives error:', error)
    res.status(500).json({ message: 'Erro ao buscar lives' })
  }
})

// Get live by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const live = await prisma.live.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        products: true,
        analytics: true,
      },
    })

    if (!live) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    res.json({ live })
  } catch (error) {
    console.error('Get live error:', error)
    res.status(500).json({ message: 'Erro ao buscar live' })
  }
})

// Create live
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, scheduledAt, duration, status } = req.body

    if (!title || !scheduledAt) {
      res.status(400).json({ message: 'Titulo e data sao obrigatorios' })
      return
    }

    const live = await prisma.live.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration,
        status: status || 'SCHEDULED',
        userId: req.user.id,
      },
      include: {
        products: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'LIVE',
      entityId: live.id,
      details: { title: live.title },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ live })
  } catch (error) {
    console.error('Create live error:', error)
    res.status(500).json({ message: 'Erro ao criar live' })
  }
})

// Update live
router.put('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description, scheduledAt, duration, status } = req.body

    const existingLive = await prisma.live.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    })

    if (!existingLive) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    const live = await prisma.live.update({
      where: { id },
      data: {
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        duration,
        status,
      },
      include: {
        products: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'LIVE',
      entityId: live.id,
      details: { title: live.title },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ live })
  } catch (error) {
    console.error('Update live error:', error)
    res.status(500).json({ message: 'Erro ao atualizar live' })
  }
})

// Delete live
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existingLive = await prisma.live.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    })

    if (!existingLive) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    await prisma.live.delete({ where: { id } })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'LIVE',
      entityId: id,
      details: { title: existingLive.title },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Live excluida com sucesso' })
  } catch (error) {
    console.error('Delete live error:', error)
    res.status(500).json({ message: 'Erro ao excluir live' })
  }
})

// Start live
router.post('/:id/start', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existingLive = await prisma.live.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    })

    if (!existingLive) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    const live = await prisma.live.update({
      where: { id },
      data: { status: 'LIVE' },
    })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'START_LIVE',
      entity: 'LIVE',
      entityId: live.id,
      details: { title: live.title },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ live })
  } catch (error) {
    console.error('Start live error:', error)
    res.status(500).json({ message: 'Erro ao iniciar live' })
  }
})

// End live
router.post('/:id/end', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existingLive = await prisma.live.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    })

    if (!existingLive) {
      res.status(404).json({ message: 'Live nao encontrada' })
      return
    }

    const live = await prisma.live.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'END_LIVE',
      entity: 'LIVE',
      entityId: live.id,
      details: { title: live.title },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    // Calculate real analytics from events
    const viewsCount = await prisma.analyticsEvent.count({
      where: { liveId: id, type: 'view' },
    })

    const purchases = await prisma.analyticsEvent.findMany({
      where: { liveId: id, type: 'purchase' },
    })

    const salesCount = purchases.length
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
    const conversion = viewsCount > 0 ? (salesCount / viewsCount) * 100 : 0

    // Upsert analytics with real data
    await prisma.analytics.upsert({
      where: { liveId: id },
      update: {
        views: viewsCount,
        sales: salesCount,
        revenue: totalRevenue,
        conversion: Math.round(conversion * 100) / 100,
      },
      create: {
        liveId: id,
        views: viewsCount,
        sales: salesCount,
        revenue: totalRevenue,
        conversion: Math.round(conversion * 100) / 100,
      },
    })

    res.json({ live })
  } catch (error) {
    console.error('End live error:', error)
    res.status(500).json({ message: 'Erro ao encerrar live' })
  }
})

export default router
