import { PrismaClient, UserRole, Region } from '@prisma/client'
import { hashPassword } from '../src/lib/hash'

const prisma = new PrismaClient()

const MOCK_APPS = [
  { name: "Casas Bahia", region: Region.BRASIL, googleAccount: "casasbahia@google.com", appleAccount: "fabio.costa@gocase.com.br", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 50000000, rating: 4.8, pinned: true, sortOrder: 1 },
  { name: "Gocase", region: Region.BRASIL, googleAccount: "gocase@gocase.com", appleAccount: "contato@gocase.com", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 10000000, rating: 4.8, pinned: true, sortOrder: 2 },
  { name: "Gocase USA", region: Region.INTERNACIONAL, googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "published", appVersion: "1.2.3", appLastUpdate: "20/06/2026", installations: 100000, rating: 4.7, pinned: false, sortOrder: 3 },
  { name: "Ponto", region: Region.BRASIL, googleAccount: "ponto.fie@gocase.com.br", appleAccount: "ponto@gocase.com", playStatus: "published", playVersion: "5.58.0", playLastUpdate: "19/06/2026", appStatus: "published", appVersion: "6.9.2", appLastUpdate: "19/06/2026", installations: 10000000, rating: 4.8, pinned: false, sortOrder: 4 },
  { name: "Casas Bahia (Serv.)", region: Region.BRASIL, googleAccount: "casasbahia.servicos.gms@gocase.com.br", appleAccount: "casasbahia.servicos@gocase.com", playStatus: "published", playVersion: "5.59.0", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.0", appLastUpdate: "20/06/2026", installations: 1000000, rating: 4.8, pinned: false, sortOrder: 5 },
  { name: "Extra", region: Region.BRASIL, googleAccount: "extra@gocase.com", appleAccount: "contatoextra@gocase.com", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 5000000, rating: 4.8, pinned: false, sortOrder: 6 },
  { name: "The Bar", region: Region.BRASIL, googleAccount: "", appleAccount: "thebar@gocase.com", playStatus: "published", playVersion: "5.59.0", playLastUpdate: "19/06/2026", appStatus: "published", appVersion: "6.9.1", appLastUpdate: "19/06/2026", installations: 500000, rating: 4.8, pinned: false, sortOrder: 7 },
  { name: "Casas Bahia (PF)", region: Region.BRASIL, googleAccount: "casasbahia.pf.gms@gocase.com.br", appleAccount: "casasbahia.pf@gocase.com", playStatus: "published", playVersion: "5.59.1", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "6.10.1", appLastUpdate: "20/06/2026", installations: 10000000, rating: 4.7, pinned: false, sortOrder: 8 },
  { name: "Bannerfy", region: Region.BRASIL, googleAccount: "", appleAccount: "", playStatus: "published", playVersion: "1.0.0", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "1.0.0", appLastUpdate: "20/06/2026", installations: 50000, rating: 5.0, pinned: true, sortOrder: 9 },
  { name: "Shopfy", region: Region.BRASIL, googleAccount: "", appleAccount: "", playStatus: "published", playVersion: "1.0.0", playLastUpdate: "07/02/2025", appStatus: "unpublished", appVersion: "1.0.0", appLastUpdate: "07/02/2025", installations: 10000, rating: 5.0, pinned: false, sortOrder: 10 },
  { name: "Gocase MX", region: Region.INTERNACIONAL, googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 11 },
  { name: "Casas Bahia MX", region: Region.INTERNACIONAL, googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 12 },
  { name: "Gocase CO", region: Region.INTERNACIONAL, googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 13 },
  { name: "Casas Bahia CO", region: Region.INTERNACIONAL, googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 14 },
  { name: "Extra MX", region: Region.INTERNACIONAL, googleAccount: "", appleAccount: "contato@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "waiting", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 15 },
]

async function main() {
  console.log('Seeding database...')

  const org = await prisma.organization.upsert({
    where: { slug: 'sas-tech' },
    update: {},
    create: { name: 'SAS TECH', slug: 'sas-tech' },
  })
  console.log(`  Organization: ${org.name} (${org.slug})`)

  const adminPassword = await hashPassword('Admin123@')
  await prisma.user.upsert({
    where: { email: 'bruno.melo@sasi.com.br' },
    update: { password: adminPassword, role: UserRole.ADMIN },
    create: {
      username: 'bruno.melo',
      email: 'bruno.melo@sasi.com.br',
      password: adminPassword,
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  })

  const userPassword = await hashPassword('User123@')
  await prisma.user.upsert({
    where: { email: 'user@sasi.com.br' },
    update: { password: userPassword, role: UserRole.VIEWER },
    create: {
      username: 'user',
      email: 'user@sasi.com.br',
      password: userPassword,
      role: UserRole.VIEWER,
      organizationId: org.id,
    },
  })

  const managerPassword = await hashPassword('Manager123@')
  await prisma.user.upsert({
    where: { email: 'manager@sasi.com.br' },
    update: { password: managerPassword, role: UserRole.MANAGER },
    create: {
      username: 'manager',
      email: 'manager@sasi.com.br',
      password: managerPassword,
      role: UserRole.MANAGER,
      organizationId: org.id,
    },
  })

  const ownerPassword = await hashPassword('Owner123@')
  await prisma.user.upsert({
    where: { email: 'owner@sasi.com.br' },
    update: { password: ownerPassword, role: UserRole.OWNER },
    create: {
      username: 'owner',
      email: 'owner@sasi.com.br',
      password: ownerPassword,
      role: UserRole.OWNER,
      organizationId: org.id,
    },
  })
  console.log('  Users created (owner, admin, manager, viewer)')

  await prisma.app.deleteMany()
  await prisma.app.createMany({
    data: MOCK_APPS.map((app) => ({ ...app, organizationId: org.id })),
  })
  console.log(`  ${MOCK_APPS.length} apps created`)

  const googleConnection = await prisma.storeConnection.create({
    data: {
      organizationId: org.id,
      store: 'GOOGLE',
      label: 'Google Play SAS TECH',
    },
  })
  await prisma.connectionConfig.create({
    data: {
      storeConnectionId: googleConnection.id,
      encryptedData: 'mock-encrypted',
      iv: 'mock-iv',
      tag: 'mock-tag',
      keyVersion: 1,
    },
  })
  console.log(`  Google Play connection created`)

  const appleConnection = await prisma.storeConnection.create({
    data: {
      organizationId: org.id,
      store: 'APPLE',
      label: 'Apple Store SAS TECH',
    },
  })
  await prisma.connectionConfig.create({
    data: {
      storeConnectionId: appleConnection.id,
      encryptedData: 'mock-encrypted',
      iv: 'mock-iv',
      tag: 'mock-tag',
      keyVersion: 1,
    },
  })
  console.log(`  Apple Store connection created`)

  console.log('Seed complete')
  console.log('  Owner:  owner@sasi.com.br / Owner123@')
  console.log('  Admin:  bruno.melo@sasi.com.br / Admin123@')
  console.log('  Manager: manager@sasi.com.br / Manager123@')
  console.log('  Viewer: user@sasi.com.br / User123@')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
