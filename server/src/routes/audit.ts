import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination.js'
import '../types/index.js'

const router = Router()

// Get own recent activity (any authenticated user)
router.get('/my-activity', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50)
    const logs = await prisma.auditLog.findMany({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    res.json({ data: logs, total: logs.length })
  } catch (error) {
    console.error('Get my activity error:', error)
    res.status(500).json({ message: 'Erro ao buscar atividades' })
  }
})

// All routes below require admin
router.use(authenticate, requireAdmin)

// Get all audit logs with pagination and filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit, search, sortOrder } = params
    const { action, entity, userId, startDate, endDate } = req.query as {
      action?: string
      entity?: string
      userId?: string
      startDate?: string
      endDate?: string
    }

    const where: Prisma.AuditLogWhereInput = {
      ...(action && { action }),
      ...(entity && { entity }),
      ...(userId && { userId }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      } : {}),
      ...(search && {
        OR: [
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { details: { contains: search } },
        ],
      }),
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    res.json(buildPaginatedResponse(logs, total, params))
  } catch (error) {
    console.error('Get audit logs error:', error)
    res.status(500).json({ message: 'Erro ao buscar logs de auditoria' })
  }
})

// Get audit log statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalLogs, todayLogs, actionCounts, entityCounts] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        _count: { entity: true },
      }),
    ])

    res.json({
      stats: {
        totalLogs,
        todayLogs,
        actionCounts: actionCounts.reduce((acc, item) => {
          acc[item.action] = item._count.action
          return acc
        }, {} as Record<string, number>),
        entityCounts: entityCounts.reduce((acc, item) => {
          acc[item.entity] = item._count.entity
          return acc
        }, {} as Record<string, number>),
      },
    })
  } catch (error) {
    console.error('Get audit stats error:', error)
    res.status(500).json({ message: 'Erro ao buscar estatísticas de auditoria' })
  }
})

// Get audit log by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    if (!log) {
      res.status(404).json({ message: 'Log não encontrado' })
      return
    }

    res.json({ log })
  } catch (error) {
    console.error('Get audit log error:', error)
    res.status(500).json({ message: 'Erro ao buscar log de auditoria' })
  }
})

export default router

// Helper function to create audit log (exported for use in other routes)
export async function createAuditLog(data: {
  userId: string
  action: string
  entity: string
  entityId?: string
  details?: object
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('Create audit log error:', error)
  }
}
