import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import authRoutes from './routes/auth'
import appsRoutes from './routes/apps'
import usersRoutes from './routes/users'
import invitesRoutes from './routes/invites'
import { prisma } from './lib/prisma'

const app = express()

app.use(helmet())
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(generalLimiter)

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' })
  }
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/apps', appsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/invites', invitesRoutes)

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`)
})

export default app
