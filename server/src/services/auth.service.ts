import { UserRole } from '@prisma/client'
import { userRepository, sessionRepository, inviteRepository } from '../repositories'
import { hashPassword, comparePassword } from '../lib/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../lib/jwt'
import { AuthenticationError, NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { withTx } from '../lib/prisma'
import { getLogger } from '../lib/logger'
import { AuditService } from './audit.service'
import { AuthUser, LoginRequest, RegisterRequest } from '../types'

export class AuthService {
  private audit: AuditService
  private logger = getLogger()

  constructor() {
    this.audit = new AuditService()
  }

  async login(data: LoginRequest, ip?: string): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmailOrUsername(data.username)
    if (!user) {
      throw new AuthenticationError('Credenciais inválidas')
    }

    const valid = await comparePassword(data.password, user.password)
    if (!valid) {
      throw new AuthenticationError('Credenciais inválidas')
    }

    const orgId = user.organizationId ?? 1
    const payload: JwtPayload = { userId: user.id, organizationId: orgId, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await withTx(async (tx) => {
      await tx.session.create({
        data: { token: refreshToken, expiresAt, user: { connect: { id: user.id } } },
      })
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
          metadata: {},
          ip,
        } as any,
      })
    })

    this.logger.info({ userId: user.id }, 'User logged in')

    return {
      user: { id: user.id, username: user.username, email: user.email, role: user.role as UserRole, organizationId: user.organizationId },
      accessToken,
      refreshToken,
    }
  }

  async register(data: RegisterRequest, ip?: string): Promise<void> {
    const { email, password } = data

    const existingEmail = await userRepository.findByEmail(email)
    if (existingEmail) {
      throw new ConflictError('E-mail já cadastrado')
    }

    const hashed = await hashPassword(password)
    const username = email.split('@')[0]

    let finalUsername = username
    let attempt = 0
    while (await userRepository.findByUsername(finalUsername)) {
      attempt++
      finalUsername = `${username}${attempt}`
    }

    const invite = await inviteRepository.findByEmail(email)
    const role = invite ? (invite.role as UserRole) : UserRole.VIEWER

    await withTx(async (tx) => {
      const user = await tx.user.create({
        data: { email, username: finalUsername, password: hashed, role },
      })

      if (invite) {
        await tx.invite.deleteMany({ where: { email } })
      }

      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'REGISTER',
          entity: 'User',
          entityId: user.id,
          metadata: { email },
          ip,
        } as any,
      })
    })

    this.logger.info({ email }, 'User registered')
  }

  async refresh(token: string, ip?: string): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    const session = await sessionRepository.findByToken(token)
    if (!session || session.expiresAt < new Date()) {
      throw new AuthenticationError('Sessão expirada')
    }

    const payload = verifyRefreshToken(token)
    const user = await userRepository.findById(payload.userId)
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado')
    }

    const orgId = user.organizationId ?? 1
    const newPayload: JwtPayload = { userId: user.id, organizationId: orgId, role: user.role }
    const accessToken = signAccessToken(newPayload)
    const refreshToken = signRefreshToken(newPayload)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await withTx(async (tx) => {
      await tx.session.delete({ where: { id: session.id } })
      await tx.session.create({
        data: { token: refreshToken, expiresAt, user: { connect: { id: user.id } } },
      })
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'REFRESH_TOKEN',
          entity: 'User',
          entityId: user.id,
          metadata: {},
          ip,
        } as any,
      })
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
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    const valid = await comparePassword(currentPassword, user.password)
    if (!valid) {
      throw new ValidationError('Senha atual inválida')
    }

    const hashed = await hashPassword(newPassword)

    await withTx(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { password: hashed } })
      await tx.session.deleteMany({ where: { userId } })
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId,
          action: 'CHANGE_PASSWORD',
          entity: 'User',
          entityId: userId,
          metadata: {},
          ip,
        } as any,
      })
    })

    this.logger.info({ userId }, 'Password changed')
  }

  async checkEmail(email: string): Promise<boolean> {
    const user = await userRepository.findByEmail(email)
    return !!user
  }

  async resetPassword(email: string, password: string, ip?: string): Promise<void> {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('E-mail não encontrado')
    }

    const hashed = await hashPassword(password)

    await withTx(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { password: hashed } })
      await tx.session.deleteMany({ where: { userId: user.id } })
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action: 'RESET_PASSWORD',
          entity: 'User',
          entityId: user.id,
          metadata: {},
          ip,
        } as any,
      })
    })

    this.logger.info({ userId: user.id }, 'Password reset')
  }

  async getAuthenticatedUser(userId: number): Promise<AuthUser> {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado')
    }
    return { id: user.id, username: user.username, email: user.email, role: user.role as UserRole, organizationId: user.organizationId }
  }
}
