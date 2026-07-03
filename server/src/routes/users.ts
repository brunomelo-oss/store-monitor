import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { hashPassword } from '../lib/hash'
import { z } from 'zod'

const router = Router()

// GET /api/users (admin)
router.get('/', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(users)
})

// POST /api/users (admin) - cria usuário manualmente
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { email, password, role } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios' })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return res.status(409).json({ error: 'E-mail já cadastrado' })

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      username: email.split('@')[0],
      email: email.toLowerCase(),
      password: hashed,
      role: role === 'admin' ? 'admin' : 'user',
    },
  })

  return res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role })
})

// PATCH /api/users/:id/role (admin)
router.patch('/:id/role', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (id === req.user!.userId) return res.status(400).json({ error: 'Você não pode alterar seu próprio papel' })

  const { role } = req.body
  if (role !== 'admin' && role !== 'user') return res.status(400).json({ error: 'Role inválida' })

  const user = await prisma.user.update({ where: { id }, data: { role } })
  return res.json({ id: user.id, username: user.username, email: user.email, role: user.role })
})

// PATCH /api/users/:id/password (admin)
router.patch('/:id/password', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const { password } = req.body
  if (!password || password.length < 8) return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' })

  const hashed = await hashPassword(password)
  await prisma.user.update({ where: { id }, data: { password: hashed } })
  return res.json({ ok: true })
})

// DELETE /api/users/:id (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (id === req.user!.userId) return res.status(400).json({ error: 'Você não pode se excluir' })
  await prisma.user.delete({ where: { id } })
  return res.json({ ok: true })
})

export default router
