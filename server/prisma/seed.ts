import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/hash'

const prisma = new PrismaClient()

const MOCK_APPS = [
  { name: "Casas Bahia", region: "Brasil", googleAccount: "casasbahia@google.com", appleAccount: "fabio.costa@gocase.com.br", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 50000000, rating: 4.8, pinned: true, sortOrder: 1 },
  { name: "Gocase", region: "Brasil", googleAccount: "gocase@gocase.com", appleAccount: "contato@gocase.com", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 10000000, rating: 4.8, pinned: true, sortOrder: 2 },
  { name: "Gocase USA", region: "Internacional", googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "published", appVersion: "1.2.3", appLastUpdate: "20/06/2026", installations: 100000, rating: 4.7, pinned: false, sortOrder: 3 },
  { name: "Ponto", region: "Brasil", googleAccount: "ponto.fie@gocase.com.br", appleAccount: "ponto@gocase.com", playStatus: "published", playVersion: "5.58.0", playLastUpdate: "19/06/2026", appStatus: "published", appVersion: "6.9.2", appLastUpdate: "19/06/2026", installations: 10000000, rating: 4.8, pinned: false, sortOrder: 4 },
  { name: "Casas Bahia (Serv.)", region: "Brasil", googleAccount: "casasbahia.servicos.gms@gocase.com.br", appleAccount: "casasbahia.servicos@gocase.com", playStatus: "published", playVersion: "5.59.0", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.0", appLastUpdate: "20/06/2026", installations: 1000000, rating: 4.8, pinned: false, sortOrder: 5 },
  { name: "Extra", region: "Brasil", googleAccount: "extra@gocase.com", appleAccount: "contatoextra@gocase.com", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 5000000, rating: 4.8, pinned: false, sortOrder: 6 },
  { name: "The Bar", region: "Brasil", googleAccount: "", appleAccount: "thebar@gocase.com", playStatus: "published", playVersion: "5.59.0", playLastUpdate: "19/06/2026", appStatus: "published", appVersion: "6.9.1", appLastUpdate: "19/06/2026", installations: 500000, rating: 4.8, pinned: false, sortOrder: 7 },
  { name: "Casas Bahia (PF)", region: "Brasil", googleAccount: "casasbahia.pf.gms@gocase.com.br", appleAccount: "casasbahia.pf@gocase.com", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 10000000, rating: 4.7, pinned: false, sortOrder: 8 },
  { name: "Bannerfy", region: "Brasil", googleAccount: "", appleAccount: "", playStatus: "published", playVersion: "1.0.0", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "1.0.0", appLastUpdate: "20/06/2026", installations: 50000, rating: 5.0, pinned: true, sortOrder: 9 },
  { name: "Shopfy", region: "Brasil", googleAccount: "", appleAccount: "", playStatus: "published", playVersion: "1.0.0", playLastUpdate: "07/02/2025", appStatus: "unpublished", appVersion: "1.0.0", appLastUpdate: "07/02/2025", installations: 10000, rating: 5.0, pinned: false, sortOrder: 10 },
  { name: "Gocase MX", region: "Internacional", googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 11 },
  { name: "Casas Bahia MX", region: "Internacional", googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 12 },
  { name: "Gocase CO", region: "Internacional", googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 13 },
  { name: "Casas Bahia CO", region: "Internacional", googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 14 },
  { name: "Extra MX", region: "Internacional", googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 15 },
]

async function main() {
  console.log('🌱 Seeding database...')

  const adminPassword = await hashPassword('Admin123@')
  await prisma.user.upsert({
    where: { email: 'bruno.melo@sasi.com.br' },
    update: { password: adminPassword, role: 'admin' },
    create: {
      username: 'bruno.melo',
      email: 'bruno.melo@sasi.com.br',
      password: adminPassword,
      role: 'admin',
    },
  })

  const userPassword = await hashPassword('User123@')
  await prisma.user.upsert({
    where: { email: 'user@sasi.com.br' },
    update: { password: userPassword, role: 'user' },
    create: {
      username: 'user',
      email: 'user@sasi.com.br',
      password: userPassword,
      role: 'user',
    },
  })

  await prisma.app.deleteMany()
  await prisma.app.createMany({ data: MOCK_APPS })

  console.log('✅ Seed complete')
  console.log('   Admin: bruno.melo@sasi.com.br / Admin123@')
  console.log('   User:  user@sasi.com.br / User123@')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
