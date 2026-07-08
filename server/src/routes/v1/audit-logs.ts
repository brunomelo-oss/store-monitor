import { Router } from 'express'
import { auditLogController } from '../../controllers'
import { requireAuth } from '../../middleware/auth'

const router = Router()

router.get('/', requireAuth, auditLogController.list.bind(auditLogController))

export default router
