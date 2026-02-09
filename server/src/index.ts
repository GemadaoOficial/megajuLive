import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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
const PORT = Number(process.env.PORT) || 5000
const prisma = new PrismaClient()

// Seed database on first run (Electron mode)
async function seedDatabase() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@megaju.com' }
    })

    if (!existingAdmin) {
      console.log('🌱 Creating default users...')

      const hashedAdminPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          email: 'admin@megaju.com',
          password: hashedAdminPassword,
          name: 'Administrador',
          role: 'ADMIN'
        }
      })

      const hashedUserPassword = await bcrypt.hash('user123', 10)
      await prisma.user.create({
        data: {
          email: 'user@megaju.com',
          password: hashedUserPassword,
          name: 'Colaborador',
          role: 'COLABORADOR'
        }
      })

      console.log('✅ Default users created')
    }
  } catch (error) {
    console.error('⚠️  Seed error:', error)
  }
}

// Run seed if in production (Electron)
if (process.env.NODE_ENV === 'production') {
  seedDatabase().catch(console.error)
}

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

// Serve frontend static files in production
const isProduction = process.env.NODE_ENV === 'production'
const clientPath = process.env.CLIENT_PATH || path.join(__dirname, '..', '..', 'client', 'dist')

// Check if client dist exists
const clientDistExists = fs.existsSync(clientPath)

if (clientDistExists) {
  console.log('📁 Serving static files from:', clientPath)
  app.use(express.static(clientPath))

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req: Request, res: Response) => {
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
