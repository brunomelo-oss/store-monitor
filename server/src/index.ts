import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config'
import authRoutes from './routes/auth'
import appsRoutes from './routes/apps'
import usersRoutes from './routes/users'
import invitesRoutes from './routes/invites'

const app = express()

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/apps', appsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/invites', invitesRoutes)

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`)
})

export default app
