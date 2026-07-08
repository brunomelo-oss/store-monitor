import { Router } from 'express'
import { inviteController } from '../controllers'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { idParamSchema, emailParamSchema } from '../validators'

const router = Router()

router.get('/', requireAuth, requireAdmin, inviteController.list.bind(inviteController))
router.post('/', requireAuth, requireAdmin, inviteController.create.bind(inviteController))
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema), inviteController.delete.bind(inviteController))
router.get('/check/:email', validate(emailParamSchema), inviteController.check.bind(inviteController))

export default router
