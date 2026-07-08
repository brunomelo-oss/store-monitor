import { PrismaClient, Prisma } from '@prisma/client'
import { getLogger } from './logger'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'production'
    ? [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }]
    : [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }, { emit: 'event', level: 'info' }],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

prisma.$on('error' as never, (e: any) => {
  getLogger().error({ err: e }, 'Prisma error')
})

prisma.$on('warn' as never, (e: any) => {
  getLogger().warn({ err: e }, 'Prisma warning')
})

// Graceful shutdown
const shutdown = async () => {
  getLogger().info('Shutting down Prisma connection')
  await prisma.$disconnect()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

/**
 * Helper to run operations inside a Prisma interactive transaction.
 * Usage:
 *   await withTx(async (tx) => {
 *     await tx.user.create(...)
 *     await tx.auditLog.create(...)
 *   })
 */
export async function withTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn)
}
