import { UserRole } from '@prisma/client'
import crypto from 'crypto'
import { userRepository, sessionRepository, inviteRepository, passwordResetTokenRepository } from '../repositories'
import { hashPassword, comparePassword as comparePasswordImpl } from '../lib/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../lib/jwt'
import { AuthenticationError, NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { withTx } from '../lib/prisma'
import { getLogger } from '../lib/logger'
import { sendPasswordResetEmail } from '../lib/email.service'
import { AuditService } from './audit.service'
import { AuthUser, LoginRequest, RegisterRequest } from '../types'

export interface AuthServiceDeps {
  userRepository?: typeof userRepository
  passwordResetTokenRepository?: typeof passwordResetTokenRepository
  withTx?: typeof withTx
  comparePassword?: typeof comparePasswordImpl
}

export class AuthService {
  private audit: AuditService
  private logger = getLogger()
  private users: typeof userRepository
  private tokenRepo: typeof passwordResetTokenRepository
  private tx: typeof withTx
  private compare: typeof comparePasswordImpl

  constructor(deps: AuthServiceDeps = {}) {
    this.audit = new AuditService()
    this.users = deps.userRepository ?? userRepository
    this.tokenRepo = deps.passwordResetTokenRepository ?? passwordResetTokenRepository
    this.tx = deps.withTx ?? withTx
    this.compare = deps.comparePassword ?? comparePasswordImpl
  }

  async login(data: LoginRequest, ip?: string): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const user = await this.users.findByEmailOrUsername(data.username)
    if (!user) {
      throw new AuthenticationError('Credenciais inválidas')
    }

    const valid = await this.compare(data.password, user.password)
    if (!valid) {
      throw new AuthenticationError('Credenciais inválidas')
    }

    if (!user.organizationId) {
      throw new AuthenticationError('Conta sem organização vinculada')
    }

    const orgId = user.organizationId
    const payload: JwtPayload = { userId: user.id, organizationId: orgId, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.tx(async (tx) => {
      await tx.session.create({
        data: { token: refreshToken, expiresAt, user: { connect: { id: user.id } } },
      })
      await this.audit.log(user.id, 'LOGIN', 'User', user.id, {}, ip, tx, user.organizationId)
    })

    this.logger.info({ userId: user.id }, 'User logged in')

    return {
      user: { id: user.id, username: user.username, email: user.email, role: user.role as UserRole, organizationId: user.organizationId },
      accessToken,
      refreshToken,
    }
  }

  async setupFromInvite(data: RegisterRequest, ip?: string): Promise<void> {
    const { email, password } = data

    const existingEmail = await this.users.findByEmail(email)
    if (existingEmail) {
      throw new ConflictError('E-mail já cadastrado')
    }

    const invite = await inviteRepository.findByEmail(email)
    if (!invite) {
      throw new ValidationError('Convite não encontrado. Apenas usuários convidados podem se cadastrar.')
    }

    const hashed = await hashPassword(password)
    const username = email.split('@')[0]

    let finalUsername = username
    let attempt = 0
    while (await this.users.findByUsername(finalUsername)) {
      attempt++
      finalUsername = `${username}${attempt}`
    }

    const role = invite.role as UserRole

    await this.tx(async (tx) => {
      const user = await tx.user.create({
        data: { email, username: finalUsername, password: hashed, role },
      })

      await tx.invite.deleteMany({ where: { email } })

      await this.audit.log(user.id, 'REGISTER', 'User', user.id, { email }, ip, tx, user.organizationId)
    })

    this.logger.info({ email }, 'User registered via invite')
  }

  async refresh(token: string, ip?: string): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const session = await sessionRepository.findByToken(token)
    if (!session || session.expiresAt < new Date()) {
      throw new AuthenticationError('Sessão expirada')
    }

    const payload = verifyRefreshToken(token)
    const user = await this.users.findById(payload.userId)
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado')
    }

    if (!user.organizationId) {
      throw new AuthenticationError('Conta sem organização vinculada')
    }

    const orgId = user.organizationId
    const newPayload: JwtPayload = { userId: user.id, organizationId: orgId, role: user.role }
    const accessToken = signAccessToken(newPayload)
    const refreshToken = signRefreshToken(newPayload)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.tx(async (tx) => {
      await tx.session.delete({ where: { id: session.id } })
      await tx.session.create({
        data: { token: refreshToken, expiresAt, user: { connect: { id: user.id } } },
      })
      await this.audit.log(user.id, 'REFRESH_TOKEN', 'User', user.id, {}, ip, tx, user.organizationId)
    })

    return {
      user: { id: user.id, username: user.username, email: user.email, role: user.role as UserRole, organizationId: user.organizationId },
      accessToken,
      refreshToken,
    }
  }

  async logout(token: string): Promise<void> {
    const session = await sessionRepository.findByToken(token)
    if (session) {
      await sessionRepository.delete(session.id)
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string, ip?: string): Promise<void> {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    const valid = await this.compare(currentPassword, user.password)
    if (!valid) {
      throw new ValidationError('Senha atual inválida')
    }

    const hashed = await hashPassword(newPassword)

    await this.tx(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { password: hashed } })
      await tx.session.deleteMany({ where: { userId } })
      await this.audit.log(userId, 'CHANGE_PASSWORD', 'User', userId, {}, ip, tx, user.organizationId)
    })

    this.logger.info({ userId }, 'Password changed')
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email)

    if (!user) {
      this.logger.info({ email }, 'forgotPassword: user not found, returning silently')
      return
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    await this.tx(async (tx) => {
      await tx.passwordResetToken.deleteMany({ where: { userId: user.id } })
      await tx.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      })
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const resetLink = `${frontendUrl}/login?resetToken=${rawToken}&resetEmail=${encodeURIComponent(email)}`

    try {
      await sendPasswordResetEmail(email, resetLink)
    } catch (err) {
      this.logger.error({ err, email }, 'Failed to send password reset email')
    }

    this.logger.info({ userId: user.id }, 'Password reset requested')
  }

  async resetPassword(token: string, newPassword: string, ip?: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const resetToken = await this.tokenRepo.findByTokenHash(tokenHash)
    if (!resetToken) {
      throw new ValidationError('Token inválido ou expirado')
    }

    const hashed = await hashPassword(newPassword)
    const user = await this.users.findById(resetToken.userId)

    await this.tx(async (tx) => {
      await tx.user.update({ where: { id: resetToken.userId }, data: { password: hashed } })
      await tx.session.deleteMany({ where: { userId: resetToken.userId } })
      await tx.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } })
      await this.audit.log(resetToken.userId, 'RESET_PASSWORD', 'User', resetToken.userId, {}, ip, tx, user?.organizationId)
    })

    this.logger.info({ userId: resetToken.userId }, 'Password reset completed')
  }

  async getAuthenticatedUser(userId: number): Promise<AuthUser> {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado')
    }
    return { id: user.id, username: user.username, email: user.email, role: user.role as UserRole, organizationId: user.organizationId }
  }
}
