import { UserRole } from '@prisma/client'
import crypto from 'crypto'
import { inviteRepository } from '../repositories'
import { NotFoundError, ConflictError } from '../lib/errors'
import { getLogger } from '../lib/logger'
import { AuditService } from './audit.service'
import { InviteRequest, InviteResponse } from '../types'

export class InviteService {
  private audit: AuditService
  private logger = getLogger()

  constructor() {
    this.audit = new AuditService()
  }

  private toResponse(invite: any): InviteResponse {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role as UserRole,
      createdAt: invite.createdAt?.toISOString?.() || invite.createdAt,
    }
  }

  async list(): Promise<InviteResponse[]> {
    const invites = await inviteRepository.findMany({ orderBy: { createdAt: 'desc' } })
    return invites.map(this.toResponse)
  }

  async create(data: InviteRequest, organizationId: number, adminId?: number, ip?: string): Promise<InviteResponse> {
    const { email, role } = data

    const existing = await inviteRepository.findByEmail(email, organizationId)
    if (existing) {
      throw new ConflictError('Este e-mail já foi convidado')
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invite = await inviteRepository.create({
      email,
      role: role || UserRole.VIEWER,
      token,
      expiresAt,
      organization: { connect: { id: organizationId } },
    })

    await this.audit.log(adminId || null, 'CREATE_INVITE', 'Invite', invite.id, { email, role }, ip)
    this.logger.info({ inviteId: invite.id, email }, 'Invite created')
    return this.toResponse(invite)
  }

  async delete(id: number, adminId?: number, ip?: string): Promise<void> {
    const invite = await inviteRepository.findById(id)
    if (!invite) {
      throw new NotFoundError('Convite')
    }

    await inviteRepository.delete(id)
    await this.audit.log(adminId || null, 'DELETE_INVITE', 'Invite', id, { email: invite.email }, ip)
    this.logger.info({ inviteId: id }, 'Invite deleted')
  }

  async check(email: string): Promise<boolean> {
    const invite = await inviteRepository.findByEmail(email)
    return !!invite && invite.expiresAt > new Date()
  }
}
