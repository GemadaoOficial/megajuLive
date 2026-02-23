import { Router, Request, Response } from 'express'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

router.use(authenticate)

// GET /goals - List user goals (filter by month/year)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1
    const year = parseInt(req.query.year as string) || new Date().getFullYear()

    const goals = await prisma.goal.findMany({
      where: {
        userId: req.user.id,
        month,
        year,
      },
      orderBy: { metric: 'asc' },
    })

    res.json({ goals })
  } catch (error) {
    console.error('Get goals error:', error)
    res.status(500).json({ message: 'Erro ao buscar metas' })
  }
})

// POST /goals - Create or update goal (upsert)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { metric, target, month, year } = req.body

    const validMetrics = ['totalRevenue', 'totalOrders', 'totalViewers', 'conversionRate']
    if (!validMetrics.includes(metric)) {
      res.status(400).json({ message: 'Metrica invalida' })
      return
    }

    if (!target || target <= 0) {
      res.status(400).json({ message: 'Meta deve ser maior que zero' })
      return
    }

    const m = parseInt(month) || new Date().getMonth() + 1
    const y = parseInt(year) || new Date().getFullYear()

    const goal = await prisma.goal.upsert({
      where: {
        userId_metric_period_month_year: {
          userId: req.user.id,
          metric,
          period: 'monthly',
          month: m,
          year: y,
        },
      },
      update: { target: parseFloat(target) },
      create: {
        userId: req.user.id,
        metric,
        target: parseFloat(target),
        period: 'monthly',
        month: m,
        year: y,
      },
    })

    res.json({ goal })
  } catch (error) {
    console.error('Upsert goal error:', error)
    res.status(500).json({ message: 'Erro ao salvar meta' })
  }
})

// DELETE /goals/:id
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      res.status(404).json({ message: 'Meta nao encontrada' })
      return
    }

    await prisma.goal.delete({ where: { id: req.params.id } })
    res.json({ message: 'Meta excluida com sucesso' })
  } catch (error) {
    console.error('Delete goal error:', error)
    res.status(500).json({ message: 'Erro ao excluir meta' })
  }
})

export default router
