import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import livesRoutes from './routes/lives.js'
import modulesRoutes from './routes/modules.js'
import adminRoutes from './routes/admin.js'
import aiRoutes from './routes/ai.js'
import analyticsRoutes from './routes/analytics.js'
import analyticsHistoryRoutes from './routes/analytics-history.js'
import uploadRoutes from './routes/upload.js'
import auditRoutes from './routes/audit.js'
import liveReportsRoutes from './routes/live-reports.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Serve uploaded files (with no-download headers)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
}, express.static(path.join(process.cwd(), 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/lives', livesRoutes)
app.use('/api/modules', modulesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/analytics-history', analyticsHistoryRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/live-reports', liveReportsRoutes)

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve frontend static files in production (Electron mode)
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(process.cwd(), '..', 'client', 'dist')
  app.use(express.static(clientPath))

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req: Request, res: Response) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      res.sendFile(path.join(clientPath, 'index.html'))
    }
  })
}

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Erro interno do servidor' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
