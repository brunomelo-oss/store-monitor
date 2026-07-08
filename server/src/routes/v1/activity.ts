import { Router } from 'express'
import { activityController } from '../../controllers'
import { requireAuth } from '../../middleware/auth'

const router = Router()

router.get('/', requireAuth, activityController.list.bind(activityController))

export default router
