import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

type PasswordResetTokenModel = Prisma.PasswordResetTokenGetPayload<{}>
type PasswordResetTokenCreateInput = Prisma.PasswordResetTokenCreateInput
type PasswordResetTokenUpdateInput = Prisma.PasswordResetTokenUpdateInput

export class PasswordResetTokenRepository extends BaseRepository<PasswordResetTokenModel, PasswordResetTokenCreateInput, PasswordResetTokenUpdateInput> {
  protected get model() {
    return this.prisma.passwordResetToken
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenModel | null> {
    return this.model.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    }) as Promise<PasswordResetTokenModel | null>
  }

  async invalidateAllForUser(userId: number): Promise<void> {
    await this.model.deleteMany({ where: { userId } })
  }

  async markUsed(id: number): Promise<void> {
    await this.model.update({ where: { id }, data: { usedAt: new Date() } })
  }

  async deleteExpired(): Promise<number> {
    const result = await this.model.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    return result.count
  }
}
