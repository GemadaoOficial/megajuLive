import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { authenticate, requireAdmin } from '../middlewares/auth.js'

const router = Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads')
const videosDir = path.join(uploadsDir, 'videos')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true })
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  },
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Formato de video nao suportado. Use MP4, WebM, OGG ou MOV.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
})

// Upload video endpoint (admin only)
router.post('/video', authenticate, requireAdmin, upload.single('video'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Nenhum arquivo enviado' })
      return
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`

    res.json({
      message: 'Video enviado com sucesso',
      videoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Erro ao fazer upload do video' })
  }
})

// Delete video endpoint (admin only)
router.delete('/video/:filename', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params
    const filepath = path.join(videosDir, filename)

    if (!fs.existsSync(filepath)) {
      res.status(404).json({ message: 'Arquivo nao encontrado' })
      return
    }

    fs.unlinkSync(filepath)
    res.json({ message: 'Video excluido com sucesso' })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ message: 'Erro ao excluir video' })
  }
})

// List uploaded videos (admin only)
router.get('/videos', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const files = fs.readdirSync(videosDir)
    const videos = files.map((filename) => {
      const filepath = path.join(videosDir, filename)
      const stats = fs.statSync(filepath)
      return {
        filename,
        url: `/uploads/videos/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
      }
    })

    res.json({ videos })
  } catch (error) {
    console.error('List videos error:', error)
    res.status(500).json({ message: 'Erro ao listar videos' })
  }
})

export default router
