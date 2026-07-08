import { Router } from 'express'
import { appController } from '../controllers'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators'

const router = Router()

router.get('/', requireAuth, appController.list.bind(appController))
router.get('/:id', requireAuth, validate(idParamSchema), appController.getById.bind(appController))
router.post('/', requireAuth, requireAdmin, appController.create.bind(appController))
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema), appController.update.bind(appController))
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema), appController.delete.bind(appController))
router.patch('/:id/pin', requireAuth, requireAdmin, validate(idParamSchema), appController.togglePin.bind(appController))
router.patch('/:id/move', requireAuth, requireAdmin, validate(idParamSchema), appController.move.bind(appController))
router.put('/bulk', requireAuth, requireAdmin, appController.bulkReplace.bind(appController))

export default router
