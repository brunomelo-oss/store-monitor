import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { verifyAccessToken, getAccessToken, JwtPayload } from '../lib/jwt'
import { AuthenticationError, AuthorizationError } from '../lib/errors'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      correlationId?: string
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getAccessToken(req)
  if (!token) {
    throw new AuthenticationError('Não autenticado')
  }
  req.user = verifyAccessToken(token)
  next()
}

export function requireOrgAccess(organizationId: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Não autenticado')
    }
    if (req.user.organizationId !== organizationId) {
      throw new AuthorizationError('Acesso negado a esta organização')
    }
    next()
  }
}

export function currentOrganizationId(req: Request): number {
  const orgId = req.user?.organizationId
  if (!req.user || orgId === undefined || orgId === null) {
    throw new AuthorizationError('Usuário não vinculado a uma organização')
  }
  return orgId
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AuthenticationError('Não autenticado')
  }
  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.OWNER) {
    throw new AuthorizationError('Acesso restrito a administradores')
  }
  next()
}

export function requireManager(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AuthenticationError('Não autenticado')
  }
  const allowedRoles: UserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER]
  if (!allowedRoles.includes(req.user.role as UserRole)) {
    throw new AuthorizationError('Acesso restrito')
  }
  next()
}
