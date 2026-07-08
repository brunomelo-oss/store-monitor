import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config'
import { Request, Response } from 'express'

export interface JwtPayload {
  userId: number
  organizationId: number
  role: string
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, config.jwt.secret, { expiresIn: config.jwt.accessExpiresIn } as SignOptions)
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as SignOptions)
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const opts = getCookieOptions()
  res.cookie('access_token', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refresh_token', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

export function clearAuthCookies(res: Response) {
  const opts = getCookieOptions()
  res.clearCookie('access_token', opts)
  res.clearCookie('refresh_token', opts)
}

export function getAccessToken(req: Request): string | null {
  const fromCookie = req.cookies?.access_token
  if (fromCookie) return fromCookie
  const fromHeader = req.headers.authorization?.startsWith('Bearer ')
  if (fromHeader) return req.headers.authorization!.slice(7)
  return null
}

export function getRefreshToken(req: Request): string | null {
  return req.cookies?.refresh_token || null
}
