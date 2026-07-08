import { Router } from 'express'
import syncRoutes from './sync'
import storeConnectionRoutes from './store-connections'
import notificationRoutes from './notifications'
import auditLogRoutes from './audit-logs'
import activityRoutes from './activity'
import healthRoutes from './health'

const router = Router()

router.use('/sync', syncRoutes)
router.use('/store-connections', storeConnectionRoutes)
router.use('/notifications', notificationRoutes)
router.use('/audit-logs', auditLogRoutes)
router.use('/activity', activityRoutes)
router.use('/health', healthRoutes)

export default router
