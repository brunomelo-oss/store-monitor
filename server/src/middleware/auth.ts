import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, getAccessToken, JwtPayload } from '../lib/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getAccessToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' })
  }
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' })
  }
  next()
}
