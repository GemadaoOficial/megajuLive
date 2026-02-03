import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../utils/tokens.js'
import { createAuditLog } from './audit.js'
import '../types/index.js'

const router = Router()

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

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
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    const accessToken = generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)

    res.status(201).json({ user, accessToken, refreshToken })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Erro ao criar usuario' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email e senha sao obrigatorios' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ message: 'Credenciais invalidas' })
      return
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      res.status(401).json({ message: 'Credenciais invalidas' })
      return
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)

    const { password: _, ...userWithoutPassword } = user

    // Create audit log for login
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'AUTH',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ user: userWithoutPassword, accessToken, refreshToken })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Erro ao fazer login' })
  }
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token e obrigatorio' })
      return
    }

    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.status(401).json({ message: 'Refresh token invalido ou expirado' })
      return
    }

    // Revoke old refresh token and create new ones
    await revokeRefreshToken(refreshToken)

    const newAccessToken = generateAccessToken(userId)
    const newRefreshToken = await generateRefreshToken(userId)

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ message: 'Erro ao renovar token' })
  }
})

// Logout (revoke refresh token)
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    // Create audit log for logout
    await createAuditLog({
      userId: req.user.id,
      action: 'LOGOUT',
      entity: 'AUTH',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Erro ao fazer logout' })
  }
})

// Logout all devices
router.post('/logout-all', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    await revokeAllUserTokens(req.user.id)
    res.json({ message: 'Logout realizado em todos os dispositivos' })
  } catch (error) {
    console.error('Logout all error:', error)
    res.status(500).json({ message: 'Erro ao fazer logout em todos os dispositivos' })
  }
})

// Get current user
router.get('/me', authenticate, (req: Request, res: Response): void => {
  res.json({ user: req.user })
})

export default router
