import { Router } from 'express'
import { syncController } from '../../controllers'
import { requireAuth, requireManager } from '../../middleware/auth'

const router = Router()

router.use(requireAuth)

router.post('/', requireManager, syncController.trigger.bind(syncController))
router.get('/jobs', syncController.listJobs.bind(syncController))
router.get('/jobs/:id', syncController.getJob.bind(syncController))
router.post('/jobs/:id/retry', requireManager, syncController.retryJob.bind(syncController))
router.post('/jobs/:id/ignore', requireManager, syncController.ignoreJob.bind(syncController))
router.delete('/jobs/:id', requireManager, syncController.deleteJob.bind(syncController))
router.get('/history', syncController.listHistory.bind(syncController))
router.get('/history/:id', syncController.getHistory.bind(syncController))

export default router
