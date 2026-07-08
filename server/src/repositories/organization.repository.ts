import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

type OrganizationModel = Prisma.OrganizationGetPayload<{}>
type OrganizationCreateInput = Prisma.OrganizationCreateInput
type OrganizationUpdateInput = Prisma.OrganizationUpdateInput

export class OrganizationRepository extends BaseRepository<OrganizationModel, OrganizationCreateInput, OrganizationUpdateInput> {
  protected get model() {
    return this.prisma.organization
  }

  async findBySlug(slug: string): Promise<OrganizationModel | null> {
    return this.model.findUnique({ where: { slug } }) as Promise<OrganizationModel | null>
  }
}
