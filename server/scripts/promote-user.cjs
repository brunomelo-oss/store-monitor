const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.PROMOTE_EMAIL
  if (!email) {
    console.error('Usage: PROMOTE_EMAIL=user@email.com node scripts/promote-user.cjs')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'OWNER' },
  })

  console.log(`✅ ${email} promoted to OWNER (was ${user.role})`)
}

main()
  .catch((e) => {
    console.error('❌', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
