import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import prisma from './utils/prisma.js'
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
import notesRoutes from './routes/notes.js'
import backupRoutes from './routes/backup.js'
import settingsRoutes from './routes/settings.js'
import goalsRoutes from './routes/goals.js'
import { loadConfig } from './utils/config.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Seed database on first run (Electron mode)
async function seedDatabase() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@megaju.com' }
    })

    if (!existingAdmin && process.env.NODE_ENV !== 'production') {
      console.log('🌱 Creating default users...')

      // Generate random passwords instead of hardcoded ones
      const adminPass = crypto.randomBytes(8).toString('hex')
      const userPass = crypto.randomBytes(8).toString('hex')

      const hashedAdminPassword = await bcrypt.hash(adminPass, 10)
      await prisma.user.create({
        data: {
          email: 'admin@megaju.com',
          password: hashedAdminPassword,
          name: 'Administrador',
          role: 'ADMIN'
        }
      })

      const hashedUserPassword = await bcrypt.hash(userPass, 10)
      await prisma.user.create({
        data: {
          email: 'user@megaju.com',
          password: hashedUserPassword,
          name: 'Colaborador',
          role: 'COLABORADOR'
        }
      })

      console.log('✅ Default users created')
      console.log('⚠️  IMPORTANT — save these passwords (shown only once):')
      console.log(`   Admin: admin@megaju.com / ${adminPass}`)
      console.log(`   User:  user@megaju.com / ${userPass}`)
    }
  } catch (error) {
    console.error('⚠️  Seed error:', error)
  }
}

// Load encrypted configs from database, then seed
loadConfig()
  .then(() => seedDatabase())
  .catch(console.error)

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for SPA compatibility
  crossOriginEmbedderPolicy: false,
}))

const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173']
if (process.env.NODE_ENV === 'production' && corsOrigins.includes('http://localhost:5173')) {
  console.warn('⚠️  CORS: localhost still in allowed origins for production!')
}
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

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
app.use('/api/notes', notesRoutes)
app.use('/api/admin/backup', backupRoutes)
app.use('/api/admin/settings', settingsRoutes)
app.use('/api/goals', goalsRoutes)

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve frontend static files in production
const isProduction = process.env.NODE_ENV === 'production'
const clientPath = process.env.CLIENT_PATH || path.join(__dirname, '..', '..', 'client', 'dist')

// Check if client dist exists
const clientDistExists = fs.existsSync(clientPath)

if (clientDistExists) {
  console.log('📁 Serving static files from:', clientPath)
  app.use(express.static(clientPath))

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('{*splat}', (req: Request, res: Response) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      res.sendFile(path.join(clientPath, 'index.html'))
    }
  })
} else {
  console.log('⚠️  Client dist not found. Run "npm run build" in client folder.')
  console.log('   Expected path:', clientPath)
}

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Erro interno do servidor' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on:`)
  console.log(`   Local:   http://localhost:${PORT}`)
  console.log(`   Network: Use your local IP address`)
  console.log(`   Example: http://192.168.1.X:${PORT}`)
  console.log(`\n💡 To find your IP: run "ipconfig" and look for IPv4 Address`)
})

export default app
