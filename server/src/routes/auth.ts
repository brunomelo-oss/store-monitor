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

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/setup', authLimiter, authController.setupFromInvite.bind(authController))
router.post('/login', authLimiter, authController.login.bind(authController))
router.post('/logout', authController.logout.bind(authController))
router.post('/refresh', authController.refresh.bind(authController))
router.get('/me', requireAuth, authController.me.bind(authController))
router.post('/change-password', requireAuth, authController.changePassword.bind(authController))
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword.bind(authController))
router.post('/reset-password', forgotPasswordLimiter, authController.resetPassword.bind(authController))

const checkEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/check-email', checkEmailLimiter, authController.checkEmail.bind(authController))

export default router
