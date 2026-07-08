import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authController } from '../controllers'
import { requireAuth } from '../middleware/auth'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', authLimiter, authController.register.bind(authController))
router.post('/login', authLimiter, authController.login.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.post('/refresh', authController.refresh.bind(authController))
router.get('/me', requireAuth, authController.me.bind(authController))
router.post('/change-password', requireAuth, authController.changePassword.bind(authController))

const checkEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/check-email', checkEmailLimiter, authController.checkEmail.bind(authController))
router.post('/reset-password', authLimiter, authController.resetPassword.bind(authController))

export default router
