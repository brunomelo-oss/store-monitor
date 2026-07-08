import { Request, Response } from 'express'
import { authService } from '../services'
import { clearAuthCookies, getRefreshToken, setAuthCookies } from '../lib/jwt'
import { loginSchema, registerSchema, changePasswordSchema, checkEmailSchema, resetPasswordSchema } from '../validators'
import { ok, created, fail } from '../lib/response'

export class AuthController {
  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body)
    const result = await authService.login({ ...data, username: data.email ?? data.username! }, req.ip)
    setAuthCookies(res, result.accessToken, result.refreshToken)
    ok(res, { user: result.user })
  }

  async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body)
    await authService.register(data, req.ip)
    created(res, { ok: true })
  }

  async me(req: Request, res: Response) {
    const userId = req.user!.userId
    const user = await authService.getAuthenticatedUser(userId)
    ok(res, { user })
  }

  async refresh(req: Request, res: Response) {
    const token = getRefreshToken(req)
    if (!token) {
      return fail(res, 401, 'AUTHENTICATION_ERROR', 'Refresh token não encontrado')
    }
    try {
      const result = await authService.refresh(token, req.ip)
      setAuthCookies(res, result.accessToken, result.refreshToken)
      ok(res, { user: result.user })
    } catch (error) {
      clearAuthCookies(res)
      throw error
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = getRefreshToken(req)
      if (token) {
        await authService.logout(token)
      }
    } catch {
      // Ignore logout errors
    }
    clearAuthCookies(res)
    ok(res, { ok: true })
  }

  async changePassword(req: Request, res: Response) {
    const data = changePasswordSchema.parse(req.body)
    await authService.changePassword(req.user!.userId, data.currentPassword, data.newPassword, req.ip)
    ok(res, { ok: true })
  }

  async checkEmail(req: Request, res: Response) {
    const { email } = checkEmailSchema.parse(req.body)
    const registered = await authService.checkEmail(email)
    ok(res, { registered })
  }

  async resetPassword(req: Request, res: Response) {
    const data = resetPasswordSchema.parse(req.body)
    await authService.resetPassword(data.email, data.password, req.ip)
    ok(res, { ok: true })
  }
}
