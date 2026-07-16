import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/hash'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting users...')

  const org = await prisma.organization.upsert({
    where: { slug: 'sas-tech' },
    update: {},
    create: { name: 'SAS TECH', slug: 'sas-tech' },
  })
  console.log(`  Organization: ${org.name} (id: ${org.id})`)

  console.log('  Deleting existing sessions...')
  await prisma.session.deleteMany()

  console.log('  Deleting existing invites...')
  await prisma.invite.deleteMany()

  console.log('  Disconnecting notifications from users...')
  await prisma.notification.updateMany({
    where: { userId: { not: null } },
    data: { userId: null },
  })

  console.log('  Disconnecting audit logs from users...')
  await prisma.auditLog.updateMany({
    where: { userId: { not: null } },
    data: { userId: null },
  })

  console.log('  Deleting existing users...')
  const deleted = await prisma.user.deleteMany()
  console.log(`  Deleted ${deleted.count} users`)

  const password = await hashPassword('Admin123@')
  const user = await prisma.user.create({
    data: {
      username: 'bmelo9387',
      email: 'bmelo9387@gmail.com',
      password,
      role: 'ADMIN',
      organizationId: org.id,
    },
  })
  console.log(`  Created new admin: ${user.email} (id: ${user.id}, role: ${user.role})`)

  console.log('\nDone. New credentials:')
  console.log('  Email: bmelo9387@gmail.com')
  console.log('  Password: Admin123@')
  console.log('  Role: ADMIN')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
