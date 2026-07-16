import { Prisma, UserRole } from '@prisma/client'
import { BaseRepository } from './base.repository'

type UserModel = Prisma.UserGetPayload<{}>
type UserCreateInput = Prisma.UserCreateInput
type UserUpdateInput = Prisma.UserUpdateInput

export class UserRepository extends BaseRepository<UserModel, UserCreateInput, UserUpdateInput> {
  protected get model() {
    return this.prisma.user
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.model.findUnique({ where: { email } }) as Promise<UserModel | null>
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    return this.model.findUnique({ where: { username } }) as Promise<UserModel | null>
  }

  async count(): Promise<number> {
    return this.model.count()
  }

  async findByEmailOrUsername(identifier: string): Promise<UserModel | null> {
    return this.model.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    }) as Promise<UserModel | null>
  }

  async updateRole(id: number, role: UserRole): Promise<UserModel> {
    return this.model.update({ where: { id }, data: { role } }) as Promise<UserModel>
  }

  async updatePassword(id: number, password: string): Promise<UserModel> {
    return this.model.update({ where: { id }, data: { password } }) as Promise<UserModel>
  }

  async findAllWithoutPassword(): Promise<Omit<UserModel, 'password'>[]> {
    return this.model.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, avatarUrl: true, organizationId: true, createdAt: true, updatedAt: true },
    })
  }
}
