import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma.js'
import { Prisma } from '../generated/prisma/client.js'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination.js'
import { createAuditLog } from './audit.js'
import '../types/index.js'

const router = Router()

// All routes require admin
router.use(authenticate, requireAdmin)

// GET /admin/dashboard - Full dashboard stats from LiveReports
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalLives, reportAgg] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.live.count(),
      prisma.liveReport.aggregate({
        _sum: { totalRevenue: true, totalViewers: true, totalOrders: true },
        _avg: { conversionRate: true },
      }),
    ])

    // Recent activity from audit logs
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    })

    const recentActivity = recentLogs.map(log => {
      let details: any = {}
      try { if (log.details) details = JSON.parse(log.details) } catch { /* corrupted JSON */ }
      const actionMap: Record<string, string> = {
        CREATE: 'Criou', UPDATE: 'Atualizou', DELETE: 'Excluiu',
        LOGIN: 'Login', LOGOUT: 'Logout', START_LIVE: 'Iniciou live', END_LIVE: 'Encerrou live',
      }
      const entityMap: Record<string, string> = {
        USER: 'usuario', LIVE: 'live', PRODUCT: 'produto', AUTH: 'autenticacao',
      }
      const action = actionMap[log.action] || log.action
      const entity = entityMap[log.entity] || log.entity
      const title = details.title || details.name || ''

      const diff = Date.now() - new Date(log.createdAt).getTime()
      let time = ''
      if (diff < 60000) time = 'agora'
      else if (diff < 3600000) time = `${Math.floor(diff / 60000)} min atras`
      else if (diff < 86400000) time = `${Math.floor(diff / 3600000)}h atras`
      else time = new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

      return {
        id: log.id,
        text: `${log.user?.name || 'Sistema'}: ${action} ${entity}${title ? ': ' + title : ''}`,
        time,
        type: log.entity === 'USER' || log.entity === 'AUTH' ? 'user' : log.entity === 'LIVE' ? 'live' : 'tutorial',
      }
    })

    // Active lives (LIVE status)
    const activeLives = await prisma.live.count({ where: { status: 'LIVE' } })
    const activeLivesList = await prisma.live.findMany({
      where: { status: 'LIVE' },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    // Top streamers by revenue (from LiveReports)
    const allUsers = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id: true,
        name: true,
        avatar: true,
        liveReports: {
          select: { totalRevenue: true },
        },
        _count: { select: { lives: true } },
      },
    })

    const topStreamers = allUsers
      .map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        totalLives: u._count.lives,
        totalRevenue: u.liveReports.reduce((s, r) => s + r.totalRevenue, 0),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    res.json({
      stats: {
        totalRevenue: reportAgg._sum.totalRevenue || 0,
        activeLives,
        totalLives,
        totalUsers,
        avgEngagement: reportAgg._avg.conversionRate || 0,
      },
      topStreamers,
      recentActivity,
      activeLivesList: activeLivesList.map(l => ({
        id: l.id,
        user: l.user,
        startedAt: l.updatedAt,
        liveLink: null,
      })),
    })
  } catch (error) {
    console.error('Get admin dashboard error:', error)
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard' })
  }
})

// Get all users
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: { select: { lives: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Erro ao buscar usuarios' })
  }
})

// Create user
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Todos os campos sao obrigatorios' })
      return
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(400).json({ message: 'Email ja cadastrado' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'COLABORADOR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.status(201).json({ user })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Erro ao criar usuario' })
  }
})

// Update user
router.put('/users/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, email, password, role } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      res.status(404).json({ message: 'Usuario nao encontrado' })
      return
    }

    const data: { name?: string; email?: string; role?: string; password?: string } = { name, email, role }
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: user.id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Erro ao atualizar usuario' })
  }
})

// Delete user
router.delete('/users/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      res.status(404).json({ message: 'Usuario nao encontrado' })
      return
    }

    if (existingUser.id === req.user.id) {
      res.status(400).json({ message: 'Voce nao pode excluir sua propria conta' })
      return
    }

    await prisma.user.delete({ where: { id } })

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'USER',
      entityId: id,
      details: { name: existingUser.name, email: existingUser.email },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Usuario excluido com sucesso' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Erro ao excluir usuario' })
  }
})

// Get all lives (admin can see all users' lives)
router.get('/lives', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = parsePaginationParams(req.query as Record<string, unknown>)
    const { page, limit, search, status, sortBy, sortOrder } = params
    const { userId } = req.query as { userId?: string }

    const where: Prisma.LiveWhereInput = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { user: { name: { contains: search } } },
        ],
      }),
    }

    const [lives, total] = await Promise.all([
      prisma.live.findMany({
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
          products: true,
          analytics: true,
        },
        orderBy: { [sortBy!]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.live.count({ where }),
    ])

    res.json(buildPaginatedResponse(lives, total, params))
  } catch (error) {
    console.error('Get all lives error:', error)
    res.status(500).json({ message: 'Erro ao buscar lives' })
  }
})

// Get analytics (aggregates from LiveReport instead of old Analytics model)
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalLives, totalReports, reportAgg] = await Promise.all([
      prisma.user.count(),
      prisma.live.count(),
      prisma.liveReport.count(),
      prisma.liveReport.aggregate({
        _sum: { totalRevenue: true, totalViewers: true, totalOrders: true },
      }),
    ])

    // Recent activity from audit logs
    const recentLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    })

    const recentActivity = recentLogs.map(log => {
      let details: any = {}
      try { if (log.details) details = JSON.parse(log.details) } catch { /* corrupted JSON */ }
      const actionMap: Record<string, string> = {
        CREATE: 'Criou', UPDATE: 'Atualizou', DELETE: 'Excluiu',
        LOGIN: 'Login', LOGOUT: 'Logout', START_LIVE: 'Iniciou live', END_LIVE: 'Encerrou live',
      }
      const entityMap: Record<string, string> = {
        USER: 'usuario', LIVE: 'live', PRODUCT: 'produto', AUTH: 'autenticacao',
      }
      const action = actionMap[log.action] || log.action
      const entity = entityMap[log.entity] || log.entity
      const title = details.title || details.name || ''

      const diff = Date.now() - new Date(log.createdAt).getTime()
      let time = ''
      if (diff < 60000) time = 'agora'
      else if (diff < 3600000) time = `${Math.floor(diff / 60000)} min atras`
      else if (diff < 86400000) time = `${Math.floor(diff / 3600000)}h atras`
      else time = new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

      return {
        id: log.id,
        text: `${log.user?.name || 'Sistema'}: ${action} ${entity}${title ? ': ' + title : ''}`,
        time,
        type: log.entity === 'USER' || log.entity === 'AUTH' ? 'user' : log.entity === 'LIVE' ? 'live' : 'tutorial',
      }
    })

    res.json({
      stats: {
        totalUsers,
        totalLives,
        totalReports,
        totalViews: reportAgg._sum.totalViewers || 0,
        totalRevenue: reportAgg._sum.totalRevenue || 0,
        totalOrders: reportAgg._sum.totalOrders || 0,
      },
      recentActivity,
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Erro ao buscar analytics' })
  }
})

// GET /admin/ai-usage - AI token usage analytics
router.get('/ai-usage', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const since = new Date()
    since.setDate(since.getDate() - days)

    const where = { createdAt: { gte: since } }

    // Summary totals
    const agg = await prisma.aITokenUsage.aggregate({
      where,
      _sum: { promptTokens: true, completionTokens: true, totalTokens: true, estimatedCost: true },
      _count: true,
    })

    const totalTokens = agg._sum.totalTokens || 0
    const totalCost = agg._sum.estimatedCost || 0
    const totalRequests = agg._count
    const avgTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0

    // By feature
    const byFeatureRaw = await prisma.aITokenUsage.groupBy({
      by: ['feature'],
      where,
      _sum: { totalTokens: true, estimatedCost: true },
      _count: true,
      orderBy: { _sum: { totalTokens: 'desc' } },
    })

    const byFeature = byFeatureRaw.map((f: any) => ({
      feature: f.feature,
      tokens: f._sum.totalTokens || 0,
      cost: f._sum.estimatedCost || 0,
      requests: f._count,
    }))

    // Daily usage
    const allRecords = await prisma.aITokenUsage.findMany({
      where,
      select: { totalTokens: true, estimatedCost: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const dailyMap = new Map<string, { tokens: number; cost: number; requests: number }>()
    for (const r of allRecords) {
      const date = r.createdAt.toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { tokens: 0, cost: 0, requests: 0 }
      existing.tokens += r.totalTokens
      existing.cost += r.estimatedCost
      existing.requests++
      dailyMap.set(date, existing)
    }
    const dailyUsage = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }))

    // By user
    const byUserRaw = await prisma.aITokenUsage.groupBy({
      by: ['userId'],
      where,
      _sum: { totalTokens: true, estimatedCost: true },
      _count: true,
      orderBy: { _sum: { totalTokens: 'desc' } },
    })

    const userIds = byUserRaw.map((u: any) => u.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })
    const userMap = new Map(users.map(u => [u.id, u.name]))

    const byUser = byUserRaw.map((u: any) => ({
      userId: u.userId,
      userName: userMap.get(u.userId) || 'Desconhecido',
      tokens: u._sum.totalTokens || 0,
      cost: u._sum.estimatedCost || 0,
      requests: u._count,
    }))

    res.json({
      summary: { totalTokens, totalCost, totalRequests, avgTokensPerRequest },
      byFeature,
      dailyUsage,
      byUser,
    })
  } catch (error) {
    console.error('Get AI usage error:', error)
    res.status(500).json({ message: 'Erro ao buscar uso de IA' })
  }
})

export default router
