import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

type SessionModel = Prisma.SessionGetPayload<{}>
type SessionCreateInput = Prisma.SessionCreateInput
type SessionUpdateInput = Prisma.SessionUpdateInput

export class SessionRepository extends BaseRepository<SessionModel, SessionCreateInput, SessionUpdateInput> {
  protected get model() {
    return this.prisma.session
  }

  async findByToken(token: string): Promise<SessionModel | null> {
    return this.model.findUnique({ where: { token } }) as Promise<SessionModel | null>
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.model.deleteMany({ where: { userId } })
  }

  async deleteExpired(): Promise<number> {
    const result = await this.model.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    return result.count
  }
}
