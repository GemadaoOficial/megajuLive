import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'
import { getConfig } from '../utils/config.js'
import '../types/index.js'

interface TokenPayload {
  userId: string
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token nao fornecido' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, getConfig('JWT_SECRET')!) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      res.status(401).json({ message: 'Usuario nao encontrado' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token invalido' })
      return
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado' })
      return
    }
    console.error('Auth error:', error)
    res.status(500).json({ message: 'Erro na autenticacao' })
  }
}

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Nao autenticado' })
    return
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Acesso negado. Requer permissao de administrador.' })
    return
  }
  next()
}
