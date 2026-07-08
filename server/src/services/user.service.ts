import { UserRole } from '@prisma/client'
import { userRepository } from '../repositories'
import { hashPassword } from '../lib/hash'
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { withTx } from '../lib/prisma'
import { getLogger } from '../lib/logger'
import { AuditService } from './audit.service'
import { UserResponse, CreateUserRequest } from '../types'

export class UserService {
  private audit: AuditService
  private logger = getLogger()

  constructor() {
    this.audit = new AuditService()
  }

  private toResponse(user: any): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as UserRole,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt?.toISOString?.() || user.createdAt,
    }
  }

  async list(): Promise<UserResponse[]> {
    const users = await userRepository.findAllWithoutPassword()
    return users.map(this.toResponse)
  }

  async create(data: CreateUserRequest, adminId?: number, ip?: string): Promise<UserResponse> {
    const { email, password, role } = data

    const existing = await userRepository.findByEmail(email)
    if (existing) {
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

    const user = await withTx(async (tx) => {
      const created = await tx.user.create({
        data: { email, username: finalUsername, password: hashed, role },
      })
      await tx.auditLog.create({
        data: {
          userId: adminId || null,
          action: 'CREATE_USER',
          entity: 'User',
          entityId: created.id,
          metadata: { email, role },
          ip,
          organizationId: created.organizationId,
        } as any,
      })
      return created
    })

    this.logger.info({ userId: user.id, email }, 'User created by admin')
    return this.toResponse(user)
  }

  async updateRole(id: number, role: UserRole, adminId?: number, ip?: string): Promise<UserResponse> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    const updated = await withTx(async (tx) => {
      const result = await tx.user.update({ where: { id }, data: { role } })
      await tx.auditLog.create({
        data: {
          userId: adminId || null,
          action: 'UPDATE_USER_ROLE',
          entity: 'User',
          entityId: id,
          metadata: { oldRole: user.role, newRole: role },
          ip,
          organizationId: user.organizationId,
        } as any,
      })
      return result
    })

    this.logger.info({ userId: id, newRole: role }, 'User role updated')
    return this.toResponse(updated)
  }

  async updatePassword(id: number, password: string, adminId?: number, ip?: string): Promise<void> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    const hashed = await hashPassword(password)

    await withTx(async (tx) => {
      await tx.user.update({ where: { id }, data: { password: hashed } })
      await tx.session.deleteMany({ where: { userId: id } })
      await tx.auditLog.create({
        data: {
          userId: adminId || null,
          action: 'UPDATE_USER_PASSWORD',
          entity: 'User',
          entityId: id,
          metadata: {},
          ip,
          organizationId: user.organizationId,
        } as any,
      })
    })

    this.logger.info({ userId: id }, 'User password updated by admin')
  }

  async delete(id: number, adminId?: number, ip?: string): Promise<void> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    if (user.id === adminId) {
      throw new ValidationError('Não é possível excluir o próprio usuário')
    }

    await withTx(async (tx) => {
      await tx.user.delete({ where: { id } })
      await tx.auditLog.create({
        data: {
          userId: adminId || null,
          action: 'DELETE_USER',
          entity: 'User',
          entityId: id,
          metadata: { email: user.email },
          ip,
          organizationId: user.organizationId,
        } as any,
      })
    })

    this.logger.info({ userId: id, email: user.email }, 'User deleted')
  }
}
