import { Router, Request, Response } from 'express'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import '../types/index.js'

const router = Router()

router.use(authenticate)

// GET /api/notes - List all notes for the authenticated user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ notes })
  } catch (error) {
    console.error('Get notes error:', error)
    res.status(500).json({ message: 'Erro ao buscar notas' })
  }
})

// POST /api/notes - Create a note
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body

    const note = await prisma.note.create({
      data: {
        content: content || '',
        userId: req.user.id,
      },
    })

    res.status(201).json({ note })
  } catch (error) {
    console.error('Create note error:', error)
    res.status(500).json({ message: 'Erro ao criar nota' })
  }
})

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      res.status(404).json({ message: 'Nota não encontrada' })
      return
    }

    const { content } = req.body

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { content },
    })

    res.json({ note })
  } catch (error) {
    console.error('Update note error:', error)
    res.status(500).json({ message: 'Erro ao atualizar nota' })
  }
})

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      res.status(404).json({ message: 'Nota não encontrada' })
      return
    }

    await prisma.note.delete({ where: { id: req.params.id } })

    res.json({ message: 'Nota excluída com sucesso' })
  } catch (error) {
    console.error('Delete note error:', error)
    res.status(500).json({ message: 'Erro ao excluir nota' })
  }
})

export default router
