import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { hashPassword, comparePassword } from '../lib/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken, setAuthCookies, clearAuthCookies, getAccessToken, getRefreshToken, JwtPayload } from '../lib/jwt'
import { requireAuth } from '../middleware/auth'

const router = Router()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[a-zA-Z]/, 'Deve conter pelo menos 1 letra')
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;':",.\/<>\?`~]/, 'Deve conter pelo menos 1 caractere especial'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body)
    const email = data.email.toLowerCase()

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username: email.split('@')[0] }] } })
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado' })
    }

    const password = await hashPassword(data.password)
    const user = await prisma.user.create({
      data: {
        username: email.split('@')[0],
        email,
        password,
        role: 'user',
      },
    })

    return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.username.toLowerCase() }],
      },
    })

    if (!user || !(await comparePassword(data.password, user.password))) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' })
    }

    const payload: JwtPayload = { userId: user.id, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    setAuthCookies(res, accessToken, refreshToken)

    return res.json({
      user: { username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = getRefreshToken(req)
  if (refreshToken) {
    await prisma.session.deleteMany({ where: { token: refreshToken } })
  }
  clearAuthCookies(res)
  return res.json({ ok: true })
})

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = getRefreshToken(req)
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token ausente' })
  }

  try {
    const session = await prisma.session.findUnique({ where: { token: refreshToken } })
    if (!session || session.expiresAt < new Date()) {
      await prisma.session.deleteMany({ where: { token: refreshToken } })
      clearAuthCookies(res)
      return res.status(401).json({ error: 'Sessão expirada' })
    }

    const payload = verifyRefreshToken(refreshToken)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      clearAuthCookies(res)
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    const newPayload: JwtPayload = { userId: user.id, role: user.role }
    const newAccessToken = signAccessToken(newPayload)
    const newRefreshToken = signRefreshToken(newPayload)

    await prisma.session.deleteMany({ where: { token: refreshToken } })
    await prisma.session.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    setAuthCookies(res, newAccessToken, newRefreshToken)

    return res.json({
      user: { username: user.username, email: user.email, role: user.role },
    })
  } catch {
    clearAuthCookies(res)
    return res.status(401).json({ error: 'Refresh token inválido' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
  return res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } })
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = changePasswordSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    if (!(await comparePassword(data.currentPassword, user.password))) {
      return res.status(400).json({ error: 'Senha atual incorreta' })
    }

    const password = await hashPassword(data.newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password } })

    return res.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/auth/check-email
router.post('/check-email', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório' })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return res.status(404).json({ error: 'E-mail não encontrado' })

  return res.json({ ok: true })
})

// POST /api/auth/reset-password (simplificado - sem envio real de email)
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-mail e nova senha obrigatórios' })
  if (password.length < 8) return res.status(400).json({ error: 'Senha muito curta' })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return res.status(404).json({ error: 'E-mail não encontrado' })

  const hashed = await hashPassword(password)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  await prisma.session.deleteMany({ where: { userId: user.id } })

  return res.json({ ok: true })
})

export default router
