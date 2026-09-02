import { UserRole, User } from '@prisma/client'
import { userRepository } from '../repositories'
import { hashPassword } from '../lib/hash'
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { withTx } from '../lib/prisma'
import { getLogger } from '../lib/logger'
import { toISO } from '../lib/utils'
import { AuditService } from './audit.service'
import { UserResponse, CreateUserRequest } from '../types'

export class UserService {
  private audit: AuditService
  private logger = getLogger()

  constructor() {
    this.audit = new AuditService()
  }

  private toResponse(user: Omit<User, 'password'>): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as UserRole,
      avatarUrl: user.avatarUrl,
      createdAt: toISO(user.createdAt) ?? '',
    }
  }

  async list(organizationId: number): Promise<UserResponse[]> {
    const users = await userRepository.findAllWithoutPassword(organizationId)
    return users.map(this.toResponse)
  }

  async create(data: CreateUserRequest, organizationId: number, adminId?: number, ip?: string): Promise<UserResponse> {
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
        data: { email, username: finalUsername, password: hashed, role, organizationId },
      })
      await this.audit.log(adminId, 'CREATE_USER', 'User', created.id, { email, role }, ip, tx, organizationId)
      return created
    })

    this.logger.info({ userId: user.id, email }, 'User created by admin')
    return this.toResponse(user)
  }

  async updateRole(id: number, role: UserRole, organizationId: number, adminId?: number, ip?: string): Promise<UserResponse> {
    const user = await userRepository.findByIdInOrganization(id, organizationId)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    const updated = await withTx(async (tx) => {
      const result = await tx.user.update({ where: { id }, data: { role } })
      await this.audit.log(adminId, 'UPDATE_USER_ROLE', 'User', id, { oldRole: user.role, newRole: role }, ip, tx, organizationId)
      return result
    })

    this.logger.info({ userId: id, newRole: role }, 'User role updated')
    return this.toResponse(updated)
  }

  async updatePassword(id: number, password: string, organizationId: number, adminId?: number, ip?: string): Promise<void> {
    const user = await userRepository.findByIdInOrganization(id, organizationId)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    const hashed = await hashPassword(password)

    await withTx(async (tx) => {
      await tx.user.update({ where: { id }, data: { password: hashed } })
      await tx.session.deleteMany({ where: { userId: id } })
      await this.audit.log(adminId, 'UPDATE_USER_PASSWORD', 'User', id, {}, ip, tx, organizationId)
    })

    this.logger.info({ userId: id }, 'User password updated by admin')
  }

  async delete(id: number, organizationId: number, adminId?: number, ip?: string): Promise<void> {
    const user = await userRepository.findByIdInOrganization(id, organizationId)
    if (!user) {
      throw new NotFoundError('Usuário')
    }

    if (user.id === adminId) {
      throw new ValidationError('Não é possível excluir o próprio usuário')
    }

    await withTx(async (tx) => {
      await tx.user.delete({ where: { id } })
      await this.audit.log(adminId, 'DELETE_USER', 'User', id, { email: user.email }, ip, tx, organizationId)
    })

    this.logger.info({ userId: id, email: user.email }, 'User deleted')
  }
}
