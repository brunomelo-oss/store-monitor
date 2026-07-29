import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Limpando dados existentes...')
  await prisma.session.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.user.deleteMany()

  console.log('Criando admin...')
  const hashed = await bcrypt.hash('Admin123@', 10)

  const admin = await prisma.user.create({
    data: {
      username: 'bruninho',
      email: 'bruninho@sasi.com.br',
      password: hashed,
      role: 'OWNER',
      organizationId: 1,
    },
  })

  console.log(`Admin criado: ${admin.username} / ${admin.email} / role: ${admin.role}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
