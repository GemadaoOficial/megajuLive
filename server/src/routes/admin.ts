import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import prisma from '../utils/prisma.js'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination.js'
import { createAuditLog } from './audit.js'
import '../types/index.js'

const router = Router()

// All routes require admin
router.use(authenticate, requireAdmin)

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

// Get analytics
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalLives, analytics] = await Promise.all([
      prisma.user.count(),
      prisma.live.count(),
      prisma.analytics.aggregate({
        _sum: { views: true, sales: true, revenue: true },
      }),
    ])

    res.json({
      stats: {
        totalUsers,
        totalLives,
        totalViews: analytics._sum.views || 0,
        totalSales: analytics._sum.sales || 0,
        totalRevenue: analytics._sum.revenue || 0,
      },
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    res.status(500).json({ message: 'Erro ao buscar analytics' })
  }
})

export default router
