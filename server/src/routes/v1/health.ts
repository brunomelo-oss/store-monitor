import { Router } from 'express'
import { healthController } from '../../controllers'
import { requireAuth } from '../../middleware/auth'

const router = Router()

router.get('/', requireAuth, healthController.check.bind(healthController))

export default router
