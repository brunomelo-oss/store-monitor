import { Router } from 'express'
import { notificationsController } from '../../controllers'
import { requireAuth } from '../../middleware/auth'

const router = Router()

router.get('/', requireAuth, notificationsController.list.bind(notificationsController))
router.get('/count-unread', requireAuth, notificationsController.countUnread.bind(notificationsController))
router.patch('/:id/read', requireAuth, notificationsController.markAsRead.bind(notificationsController))
router.patch('/read-all', requireAuth, notificationsController.markAllAsRead.bind(notificationsController))

export default router
