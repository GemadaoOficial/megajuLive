import { Router, Request, Response } from 'express'
import prisma from '../utils/prisma.js'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

// Get all tutorials (public for authenticated users)
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const modules = await prisma.tutorial.findMany({
      orderBy: { order: 'asc' },
    })

    res.json({ modules })
  } catch (error) {
    console.error('Get modules error:', error)
    res.status(500).json({ message: 'Erro ao buscar tutoriais' })
  }
})

// Get tutorial by ID
router.get('/:id', authenticate, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const module = await prisma.tutorial.findUnique({
      where: { id },
    })

    if (!module) {
      res.status(404).json({ message: 'Tutorial nao encontrado' })
      return
    }

    res.json({ module })
  } catch (error) {
    console.error('Get module error:', error)
    res.status(500).json({ message: 'Erro ao buscar tutorial' })
  }
})

// Create tutorial (admin only)
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, videoUrl, content, order } = req.body

    if (!title) {
      res.status(400).json({ message: 'Titulo e obrigatorio' })
      return
    }

    const module = await prisma.tutorial.create({
      data: {
        title,
        description,
        videoUrl,
        content,
        order: order || 0,
      },
    })

    res.status(201).json({ module })
  } catch (error) {
    console.error('Create module error:', error)
    res.status(500).json({ message: 'Erro ao criar tutorial' })
  }
})

// Update tutorial (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description, videoUrl, content, order } = req.body

    const existingModule = await prisma.tutorial.findUnique({
      where: { id },
    })

    if (!existingModule) {
      res.status(404).json({ message: 'Tutorial nao encontrado' })
      return
    }

    const module = await prisma.tutorial.update({
      where: { id },
      data: {
        title,
        description,
        videoUrl,
        content,
        order,
      },
    })

    res.json({ module })
  } catch (error) {
    console.error('Update module error:', error)
    res.status(500).json({ message: 'Erro ao atualizar tutorial' })
  }
})

// Delete tutorial (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existingModule = await prisma.tutorial.findUnique({
      where: { id },
    })

    if (!existingModule) {
      res.status(404).json({ message: 'Tutorial nao encontrado' })
      return
    }

    await prisma.tutorial.delete({ where: { id } })

    res.json({ message: 'Tutorial excluido com sucesso' })
  } catch (error) {
    console.error('Delete module error:', error)
    res.status(500).json({ message: 'Erro ao excluir tutorial' })
  }
})

export default router
