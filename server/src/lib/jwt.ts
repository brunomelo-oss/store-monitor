import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config'
import { Request, Response } from 'express'

export interface JwtPayload {
  userId: number
  role: string
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'strict' as const : 'lax' as const,
  path: '/',
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
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  })
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', COOKIE_OPTIONS)
  res.clearCookie('refresh_token', COOKIE_OPTIONS)
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
