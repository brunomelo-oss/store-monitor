import { Router } from 'express'
import { storeConnectionController } from '../../controllers'
import { requireAuth, requireAdmin } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', storeConnectionController.list.bind(storeConnectionController))
router.get('/:id', storeConnectionController.getById.bind(storeConnectionController))
router.post('/', requireAdmin, storeConnectionController.create.bind(storeConnectionController))
router.put('/:id', requireAdmin, storeConnectionController.update.bind(storeConnectionController))
router.delete('/:id', requireAdmin, storeConnectionController.delete.bind(storeConnectionController))
router.post('/:id/test', storeConnectionController.test.bind(storeConnectionController))

export default router
