import { Router } from 'express'
import { userController } from '../controllers'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { idParamSchema } from '../validators'

const router = Router()

router.get('/', requireAuth, requireAdmin, userController.list.bind(userController))
router.post('/', requireAuth, requireAdmin, userController.create.bind(userController))
router.patch('/:id/role', requireAuth, requireAdmin, validate(idParamSchema), userController.updateRole.bind(userController))
router.patch('/:id/password', requireAuth, requireAdmin, validate(idParamSchema), userController.updatePassword.bind(userController))
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema), userController.delete.bind(userController))

export default router
