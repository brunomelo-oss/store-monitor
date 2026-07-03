import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

const inviteSchema = z.object({
  email: z.string().email(),
})

// GET /api/invites (admin)
router.get('/', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const invites = await prisma.invite.findMany({ orderBy: { createdAt: 'desc' } })
  return res.json(invites)
})

// POST /api/invites (admin)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = inviteSchema.parse(req.body)
    const email = data.email.toLowerCase()

    const exists = await prisma.invite.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Convite já enviado para este e-mail' })

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) return res.status(409).json({ error: 'Usuário já cadastrado' })

    const invite = await prisma.invite.create({ data: { email } })
    return res.status(201).json(invite)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/invites/:id (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await prisma.invite.delete({ where: { id } })
  return res.json({ ok: true })
})

// GET /api/invites/check/:email (public)
router.get('/check/:email', async (req: Request, res: Response) => {
  const email = req.params.email.toLowerCase()
  const invite = await prisma.invite.findUnique({ where: { email } })
  return res.json({ invited: !!invite })
})

export default router
