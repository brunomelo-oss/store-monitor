import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

function toFrontend(app: any) {
  return {
    id: app.id,
    name: app.name,
    region: app.region,
    googleAccount: app.googleAccount,
    appleAccount: app.appleAccount,
    playStore: { status: app.playStatus, version: app.playVersion, lastUpdate: app.playLastUpdate },
    appStore: { status: app.appStatus, version: app.appVersion, lastUpdate: app.appLastUpdate },
    installations: app.installations,
    rating: app.rating,
    pinned: app.pinned,
    sortOrder: app.sortOrder,
  }
}

function toDb(data: any) {
  return {
    name: data.name,
    region: data.region || 'Brasil',
    googleAccount: data.googleAccount || '',
    appleAccount: data.appleAccount || '',
    playStatus: data.playStore?.status || data.playStatus || 'unpublished',
    playVersion: data.playStore?.version || data.playVersion || '',
    playLastUpdate: data.playStore?.lastUpdate || data.playLastUpdate || '',
    appStatus: data.appStore?.status || data.appStatus || 'unpublished',
    appVersion: data.appStore?.version || data.appVersion || '',
    appLastUpdate: data.appStore?.lastUpdate || data.appLastUpdate || '',
    installations: data.installations ?? 0,
    rating: data.rating ?? 0,
  }
}

const appInputSchema = z.object({
  name: z.string().min(1),
  region: z.enum(['Brasil', 'Internacional']).optional(),
  googleAccount: z.string().optional(),
  appleAccount: z.string().optional(),
  playStore: z.object({ status: z.string(), version: z.string(), lastUpdate: z.string() }).optional(),
  appStore: z.object({ status: z.string(), version: z.string(), lastUpdate: z.string() }).optional(),
  installations: z.number().optional(),
  rating: z.number().optional(),
})

// GET /api/apps
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const apps = await prisma.app.findMany({ orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }] })
  return res.json(apps.map(toFrontend))
})

// POST /api/apps (admin)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = appInputSchema.parse(req.body)
    const maxOrder = await prisma.app.aggregate({ _max: { sortOrder: true } })
    const app = await prisma.app.create({
      data: { ...toDb(data), sortOrder: (maxOrder._max.sortOrder || 0) + 1 },
    })
    return res.status(201).json(toFrontend(app))
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/apps/:id (admin)
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const data = appInputSchema.partial().parse(req.body)
    const app = await prisma.app.update({ where: { id }, data: toDb(data) })
    return res.json(toFrontend(app))
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/apps/:id (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  await prisma.app.delete({ where: { id } })
  return res.json({ ok: true })
})

// PATCH /api/apps/:id/pin (admin)
router.patch('/:id/pin', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const app = await prisma.app.findUnique({ where: { id } })
  if (!app) return res.status(404).json({ error: 'App não encontrado' })

  const pinnedCount = await prisma.app.count({ where: { pinned: true } })
  if (!app.pinned && pinnedCount >= 3) {
    return res.status(400).json({ error: 'Máximo de 3 apps fixados' })
  }

  const updated = await prisma.app.update({ where: { id }, data: { pinned: !app.pinned } })
  return res.json(toFrontend(updated))
})

// PATCH /api/apps/:id/move (admin)
router.patch('/:id/move', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const { direction } = req.body
  if (direction !== 1 && direction !== -1) {
    return res.status(400).json({ error: 'direction deve ser 1 ou -1' })
  }

  const app = await prisma.app.findUnique({ where: { id } })
  if (!app) return res.status(404).json({ error: 'App não encontrado' })

  const neighbors = await prisma.app.findMany({
    where: { pinned: false },
    orderBy: { sortOrder: 'asc' },
  })

  const idx = neighbors.findIndex(a => a.id === id)
  if (idx === -1) return res.status(400).json({ error: 'App não encontrado na lista' })
  const target = idx + direction
  if (target < 0 || target >= neighbors.length) return res.status(400).json({ error: 'Movimento inválido' })

  const tmp = app.sortOrder
  await prisma.app.update({ where: { id }, data: { sortOrder: neighbors[target].sortOrder } })
  await prisma.app.update({ where: { id: neighbors[target].id }, data: { sortOrder: tmp } })

  const updated = await prisma.app.findMany({ orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }] })
  return res.json(updated.map(toFrontend))
})

// PUT /api/apps/bulk (admin)
router.put('/bulk', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { apps } = req.body
  if (!Array.isArray(apps)) return res.status(400).json({ error: 'apps deve ser um array' })

  await prisma.$transaction([
    prisma.app.deleteMany(),
    ...apps.map((a: any) => prisma.app.create({ data: { ...toDb(a), sortOrder: a.sortOrder || 0 } })),
  ])

  const updated = await prisma.app.findMany({ orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }] })
  return res.json(updated.map(toFrontend))
})

export default router
