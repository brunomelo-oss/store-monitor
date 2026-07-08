import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

type InviteModel = Prisma.InviteGetPayload<{}>
type InviteCreateInput = Prisma.InviteCreateInput
type InviteUpdateInput = Prisma.InviteUpdateInput

export class InviteRepository extends BaseRepository<InviteModel, InviteCreateInput, InviteUpdateInput> {
  protected get model() {
    return this.prisma.invite
  }

  async findByEmail(email: string, organizationId?: number): Promise<InviteModel | null> {
    const where: Record<string, unknown> = { email }
    if (organizationId) where.organizationId = organizationId
    return this.model.findFirst({ where }) as Promise<InviteModel | null>
  }

  async findByToken(token: string): Promise<InviteModel | null> {
    return this.model.findUnique({ where: { token } }) as Promise<InviteModel | null>
  }

  async deleteByEmail(email: string, organizationId?: number): Promise<void> {
    const where: Record<string, unknown> = { email }
    if (organizationId) where.organizationId = organizationId
    await this.model.deleteMany({ where })
  }
}
