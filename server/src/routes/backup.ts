import { Router, Request, Response } from 'express'
import { authenticate, requireAdmin } from '../middlewares/auth.js'
import prisma from '../utils/prisma.js'
import '../types/index.js'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'

const router = Router()

// All routes require admin
router.use(authenticate, requireAdmin)

// GET /generate — SSE endpoint with progress
router.get('/generate', async (req: Request, res: Response): Promise<void> => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const sendProgress = (progress: number, message: string, step: string) => {
    res.write(`data: ${JSON.stringify({ progress, message, step })}\n\n`)
  }

  try {
    // Create backups directory
    const backupsDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `backup-${timestamp}.zip`
    const filepath = path.join(backupsDir, filename)

    sendProgress(5, 'Iniciando backup...', 'init')

    // Create ZIP archive
    const output = fs.createWriteStream(filepath)
    const archive = archiver('zip', { zlib: { level: 6 } })
    archive.pipe(output)

    // Step 1: Export database tables (10-50%)
    sendProgress(10, 'Exportando usuarios...', 'database')

    const tables = [
      { name: 'users', query: () => prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true, updatedAt: true } }), progress: 14 },
      { name: 'lives', query: () => prisma.live.findMany(), progress: 18 },
      { name: 'live-reports', query: () => prisma.liveReport.findMany(), progress: 24 },
      { name: 'live-products', query: () => prisma.liveProduct.findMany(), progress: 28 },
      { name: 'products', query: () => prisma.product.findMany(), progress: 32 },
      { name: 'tutorials', query: () => prisma.tutorial.findMany(), progress: 36 },
      { name: 'analytics', query: () => prisma.analytics.findMany(), progress: 38 },
      { name: 'analytics-events', query: () => prisma.analyticsEvent.findMany(), progress: 42 },
      { name: 'analytics-snapshots', query: () => prisma.analyticsSnapshot.findMany(), progress: 44 },
      { name: 'audit-logs', query: () => prisma.auditLog.findMany(), progress: 46 },
      { name: 'notes', query: () => prisma.note.findMany(), progress: 50 },
    ]

    const counts: Record<string, number> = {}

    for (const table of tables) {
      sendProgress(table.progress, `Exportando ${table.name}...`, 'database')
      const data = await table.query()
      counts[table.name] = data.length
      archive.append(JSON.stringify(data, null, 2), { name: `database/${table.name}.json` })
    }

    // Step 2: Add uploads folder (50-80%)
    sendProgress(55, 'Compactando uploads...', 'uploads')
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads')
      sendProgress(75, 'Arquivos de upload adicionados...', 'uploads')
    } else {
      sendProgress(75, 'Pasta uploads nao encontrada, pulando...', 'uploads')
    }

    // Step 3: Add metadata
    sendProgress(80, 'Gerando metadados...', 'metadata')
    const metadata = {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      tables: counts,
      totalRecords: Object.values(counts).reduce((a, b) => a + b, 0),
    }
    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' })

    // Step 4: Finalize
    sendProgress(85, 'Finalizando arquivo ZIP...', 'finalizing')

    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve)
      archive.on('error', reject)
      archive.finalize()
    })

    const stats = fs.statSync(filepath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    sendProgress(100, 'Backup concluido!', 'done')

    // Send final event with file info
    res.write(`data: ${JSON.stringify({
      progress: 100,
      message: 'Backup concluido!',
      step: 'complete',
      filename,
      size: stats.size,
      sizeMB: `${sizeMB} MB`,
      records: metadata.totalRecords,
    })}\n\n`)

    res.end()
  } catch (error) {
    console.error('Backup error:', error)
    res.write(`data: ${JSON.stringify({ progress: -1, message: 'Erro ao gerar backup', step: 'error', error: String(error) })}\n\n`)
    res.end()
  }
})

// GET /download/:filename — Download a backup file
router.get('/download/:filename', (req: Request, res: Response): void => {
  const filename = req.params.filename as string
  // SECURITY: prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({ message: 'Nome de arquivo invalido' })
    return
  }
  const filepath = path.join(process.cwd(), 'backups', filename)
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ message: 'Backup nao encontrado' })
    return
  }
  res.download(filepath, filename)
})

// GET /list — List existing backups
router.get('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const backupsDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupsDir)) {
      res.json({ backups: [] })
      return
    }
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.endsWith('.zip'))
      .map(f => {
        const stats = fs.statSync(path.join(backupsDir, f))
        return {
          filename: f,
          size: stats.size,
          sizeMB: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          createdAt: stats.birthtime.toISOString(),
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    res.json({ backups: files })
  } catch (error) {
    console.error('List backups error:', error)
    res.status(500).json({ message: 'Erro ao listar backups' })
  }
})

// DELETE /:filename — Delete a backup
router.delete('/:filename', (req: Request, res: Response): void => {
  const filename = req.params.filename as string
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    res.status(400).json({ message: 'Nome de arquivo invalido' })
    return
  }
  const filepath = path.join(process.cwd(), 'backups', filename)
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ message: 'Backup nao encontrado' })
    return
  }
  fs.unlinkSync(filepath)
  res.json({ message: 'Backup excluido com sucesso' })
})

export default router
