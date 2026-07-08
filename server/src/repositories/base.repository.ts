import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  protected abstract get model(): any

  async findById(id: number): Promise<T | null> {
    return this.model.findUnique({ where: { id } }) as Promise<T | null>
  }

  async findMany(params?: {
    skip?: number
    take?: number
    where?: Record<string, unknown>
    orderBy?: Record<string, 'asc' | 'desc'>
  }): Promise<T[]> {
    return this.model.findMany(params || {}) as Promise<T[]>
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data }) as Promise<T>
  }

  async update(id: number, data: UpdateInput): Promise<T> {
    return this.model.update({ where: { id }, data }) as Promise<T>
  }

  async delete(id: number): Promise<T> {
    return this.model.delete({ where: { id } }) as Promise<T>
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.model.count({ where })
  }

  async exists(where: Record<string, unknown>): Promise<boolean> {
    const count = await this.model.count({ where })
    return count > 0
  }
}
