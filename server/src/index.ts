import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { loadEnv } from './lib/env'
import { createLogger, getLogger } from './lib/logger'
import { config } from './config'
import { errorHandler } from './middleware/error-handler'
import { correlationId } from './middleware/correlation-id'
import authRoutes from './routes/auth'
import appsRoutes from './routes/apps'
import usersRoutes from './routes/users'
import invitesRoutes from './routes/invites'
import v1Routes from './routes/v1'
import { prisma } from './lib/prisma'
import { PollingDispatcher } from './jobs/polling-dispatcher'

// Validate environment before anything else
loadEnv()

// Initialize logger
createLogger()

const app = express()
const logger = getLogger()
const startTime = Date.now()

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1)

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Correlation ID for request tracing
app.use(correlationId)

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(generalLimiter)

// Response time tracking
app.use((req, res, next) => {
  const start = process.hrtime.bigint()
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6
    if (duration > 1000) {
      logger.warn({ path: req.path, method: req.method, duration }, 'Slow request')
    }
  })
  next()
})

// Health endpoints (excluded from rate limiting)
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      environment: config.nodeEnv,
    })
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'Database unavailable',
      timestamp: new Date().toISOString(),
    })
  }
})

app.get('/api/ready', (_req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/apps', appsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/invites', invitesRoutes)
app.use('/api/v1', v1Routes)

// Global error handler (must be last)
app.use(errorHandler)

let dispatcher: PollingDispatcher | null = null

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.nodeEnv }, 'Server started')

  if (config.features.backgroundJobs) {
    dispatcher = new PollingDispatcher(5000)
    dispatcher.start()
    logger.info('Background job polling dispatcher started')
  }
})

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down...')
  if (dispatcher) dispatcher.stop()
  server.close(() => process.exit(0))
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export default app
