import { PrismaClient, UserRole, Region, StoreType, VersionStatus, BuildStatus, PublicationStatus, SyncStatus, SyncType, NotificationType } from '@prisma/client'
import { hashPassword } from '../src/lib/hash'

const prisma = new PrismaClient()

interface AppSeed {
  name: string
  region: Region
  city?: string
  state?: string
  googleAccount: string
  appleAccount: string
  playStatus: string
  playVersion: string
  playLastUpdate: string
  appStatus: string
  appVersion: string
  appLastUpdate: string
  installations: number
  rating: number
  pinned: boolean
  sortOrder: number
}

const MOCK_APPS: AppSeed[] = [
  { name: "Borba", region: Region.BRASIL, city: "Borba", state: "AM", googleAccount: "borba@edu.am.gov.br", appleAccount: "borba@gocase.com", playStatus: "published", playVersion: "2.1.0", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "2.1.0", appLastUpdate: "20/06/2026", installations: 15000, rating: 4.5, pinned: true, sortOrder: 1 },
  { name: "Urucurituba", region: Region.BRASIL, city: "Urucurituba", state: "AM", googleAccount: "urucurituba@edu.am.gov.br", appleAccount: "urucurituba@gocase.com", playStatus: "review", playVersion: "1.3.0", playLastUpdate: "18/06/2026", appStatus: "review", appVersion: "1.3.0", appLastUpdate: "18/06/2026", installations: 8200, rating: 4.2, pinned: false, sortOrder: 2 },
  { name: "SEMED", region: Region.BRASIL, city: "Manaus", state: "AM", googleAccount: "semed@edu.am.gov.br", appleAccount: "semed@gocase.com", playStatus: "published", playVersion: "3.0.1", playLastUpdate: "19/06/2026", appStatus: "published", appVersion: "3.0.1", appLastUpdate: "19/06/2026", installations: 45000, rating: 4.7, pinned: true, sortOrder: 3 },
  { name: "Itacoatiara", region: Region.BRASIL, city: "Itacoatiara", state: "AM", googleAccount: "itacoatiara@edu.am.gov.br", appleAccount: "itacoatiara@gocase.com", playStatus: "published", playVersion: "1.1.0", playLastUpdate: "15/06/2026", appStatus: "published", appVersion: "1.1.0", appLastUpdate: "15/06/2026", installations: 12000, rating: 4.3, pinned: false, sortOrder: 4 },
  { name: "Parintins", region: Region.BRASIL, city: "Parintins", state: "AM", googleAccount: "parintins@edu.am.gov.br", appleAccount: "parintins@gocase.com", playStatus: "published", playVersion: "1.0.2", playLastUpdate: "10/06/2026", appStatus: "rejected", appVersion: "1.0.2", appLastUpdate: "10/06/2026", installations: 9500, rating: 4.1, pinned: false, sortOrder: 5 },
  { name: "Manacapuru", region: Region.BRASIL, city: "Manacapuru", state: "AM", googleAccount: "manacapuru@edu.am.gov.br", appleAccount: "manacapuru@gocase.com", playStatus: "rejected", playVersion: "0.9.0", playLastUpdate: "05/06/2026", appStatus: "review", appVersion: "1.0.0", appLastUpdate: "12/06/2026", installations: 6300, rating: 3.8, pinned: false, sortOrder: 6 },
  { name: "Coari", region: Region.BRASIL, city: "Coari", state: "AM", googleAccount: "coari@edu.am.gov.br", appleAccount: "coari@gocase.com", playStatus: "pending", playVersion: "1.0.0", playLastUpdate: "01/06/2026", appStatus: "unpublished", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 7 },
  { name: "Tefé", region: Region.BRASIL, city: "Tefé", state: "AM", googleAccount: "tefe@edu.am.gov.br", appleAccount: "tefe@gocase.com", playStatus: "published", playVersion: "2.0.0", playLastUpdate: "25/05/2026", appStatus: "published", appVersion: "2.0.0", appLastUpdate: "25/05/2026", installations: 7800, rating: 4.6, pinned: false, sortOrder: 8 },
  { name: "Maués", region: Region.BRASIL, city: "Maués", state: "AM", googleAccount: "maues@edu.am.gov.br", appleAccount: "maues@gocase.com", playStatus: "published", playVersion: "1.2.0", playLastUpdate: "20/05/2026", appStatus: "published", appVersion: "1.2.0", appLastUpdate: "20/05/2026", installations: 5400, rating: 4.4, pinned: false, sortOrder: 9 },
  { name: "Humaitá", region: Region.BRASIL, city: "Humaitá", state: "AM", googleAccount: "humaita@edu.am.gov.br", appleAccount: "humaita@gocase.com", playStatus: "rejected", playVersion: "0.8.0", playLastUpdate: "15/05/2026", appStatus: "unpublished", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 10 },
  { name: "Lábrea", region: Region.BRASIL, city: "Lábrea", state: "AM", googleAccount: "labrea@edu.am.gov.br", appleAccount: "labrea@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "pending", appVersion: "0.5.0", appLastUpdate: "10/05/2026", installations: 0, rating: 0, pinned: false, sortOrder: 11 },
  { name: "Manaus", region: Region.BRASIL, city: "Manaus", state: "AM", googleAccount: "manaus@edu.am.gov.br", appleAccount: "manaus@gocase.com", playStatus: "published", playVersion: "4.1.0", playLastUpdate: "20/06/2026", appStatus: "published", appVersion: "4.1.0", appLastUpdate: "20/06/2026", installations: 82000, rating: 4.9, pinned: true, sortOrder: 12 },
  { name: "Presidente Figueiredo", region: Region.BRASIL, city: "Presidente Figueiredo", state: "AM", googleAccount: "pfigueiredo@edu.am.gov.br", appleAccount: "pfigueiredo@gocase.com", playStatus: "review", playVersion: "1.0.0", playLastUpdate: "22/06/2026", appStatus: "unpublished", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 13 },
  { name: "São Gabriel da Cachoeira", region: Region.BRASIL, city: "São Gabriel da Cachoeira", state: "AM", googleAccount: "sgabriel@edu.am.gov.br", appleAccount: "sgabriel@gocase.com", playStatus: "unpublished", playVersion: "", playLastUpdate: "", appStatus: "unpublished", appVersion: "", appLastUpdate: "", installations: 0, rating: 0, pinned: false, sortOrder: 14 },
  { name: "Tabatinga", region: Region.BRASIL, city: "Tabatinga", state: "AM", googleAccount: "tabatinga@edu.am.gov.br", appleAccount: "tabatinga@gocase.com", playStatus: "published", playVersion: "1.1.0", playLastUpdate: "12/06/2026", appStatus: "published", appVersion: "1.1.0", appLastUpdate: "12/06/2026", installations: 4100, rating: 4.0, pinned: false, sortOrder: 15 },
]

function makeAppSeed(prefix: string, startSort: number): AppSeed[] {
  return MOCK_APPS.map((app, i) => ({
    ...app,
    name: `${prefix} ${app.name}`,
    sortOrder: startSort + i,
    pinned: app.pinned && i < 2,
  }))
}

async function seedOrg(
  orgSlug: string,
  orgName: string,
  users: Array<{ email: string; username: string; role: UserRole; password: string }>,
  apps: AppSeed[],
) {
  const org = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: {},
    create: { name: orgName, slug: orgSlug },
  })
  console.log(`  Organization: ${org.name} (${org.slug})`)

  for (const u of users) {
    const hashed = await hashPassword(u.password)
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed, role: u.role, organizationId: org.id },
      create: {
        username: u.username,
        email: u.email,
        password: hashed,
        role: u.role,
        organizationId: org.id,
      },
    })
  }
  console.log(`  ${users.length} users created for ${org.slug}`)

  await prisma.app.deleteMany({ where: { organizationId: org.id } })

  await prisma.app.createMany({
    data: apps.map((app) => ({ ...app, organizationId: org.id })),
  })
  const createdApps = await prisma.app.findMany({
    where: { organizationId: org.id },
    orderBy: { sortOrder: 'asc' },
  })
  console.log(`  ${createdApps.length} apps created for ${org.slug}`)

  // Create relational data for dashboard demo (sequentially to avoid pool exhaustion)
  for (const app of createdApps) {
    const hasGoogle = app.playVersion && app.playVersion !== ''
    const hasApple = app.appVersion && app.appVersion !== ''

    const statusMap: Record<string, VersionStatus> = {
      'PUBLISHED': 'PUBLISHED',
      'REVIEW': 'REVIEW',
      'REJECTED': 'REJECTED',
      'PENDING': 'DRAFT',
      'UNPUBLISHED': 'DRAFT',
      'WAITING': 'DRAFT',
    }
    if (hasGoogle) {
      await prisma.version.create({
        data: {
          appId: app.id,
          store: 'GOOGLE',
          version: app.playVersion || '1.0.0',
          buildNumber: '1',
          status: statusMap[app.playStatus?.toUpperCase() || ''] || 'DRAFT',
        },
      })
    }
    if (hasApple) {
      await prisma.version.create({
        data: {
          appId: app.id,
          store: 'APPLE',
          version: app.appVersion || '1.0.0',
          buildNumber: '1',
          status: statusMap[app.appStatus?.toUpperCase() || ''] || 'DRAFT',
        },
      })
    }

    await prisma.build.create({
      data: {
        appId: app.id,
        store: 'GOOGLE',
        buildNumber: '1',
        status: hasGoogle ? ('APPROVED' as BuildStatus) : ('PROCESSING' as BuildStatus),
      },
    })
    await prisma.build.create({
      data: {
        appId: app.id,
        store: 'APPLE',
        buildNumber: '1',
        status: hasApple ? ('APPROVED' as BuildStatus) : ('PROCESSING' as BuildStatus),
      },
    })
  }

  return { org, createdApps }
}

async function main() {
  console.log('Seeding database...')

  const sasUsers = [
    { email: 'bruno.melo@sasi.com.br', username: 'bruno.melo', role: UserRole.ADMIN, password: 'Admin123@' },
    { email: 'owner@sasi.com.br', username: 'owner', role: UserRole.OWNER, password: 'Owner123@' },
    { email: 'manager@sasi.com.br', username: 'manager', role: UserRole.MANAGER, password: 'Manager123@' },
    { email: 'user@sasi.com.br', username: 'user', role: UserRole.VIEWER, password: 'User123@' },
  ]

  const partnerUsers = [
    { email: 'alice@partner.com.br', username: 'alice', role: UserRole.OWNER, password: 'Partner123@' },
    { email: 'bob@partner.com.br', username: 'bob', role: UserRole.ADMIN, password: 'Partner123@' },
    { email: 'carol@partner.com.br', username: 'carol', role: UserRole.MANAGER, password: 'Partner123@' },
    { email: 'dave@partner.com.br', username: 'dave', role: UserRole.VIEWER, password: 'Partner123@' },
  ]

  const sasApps = makeAppSeed('', 1)
  const partnerApps = makeAppSeed('Partner', 1).slice(0, 4)

  await seedOrg('sas-tech', 'SAS TECH', sasUsers, sasApps)
  await seedOrg('partner-tech', 'Partner TECH', partnerUsers, partnerApps)

  const org = await prisma.organization.findUnique({ where: { slug: 'sas-tech' } })!
  const partnerOrg = await prisma.organization.findUnique({ where: { slug: 'partner-tech' } })!

  // Create audit log entries for dashboard timeline (per organization)
  const actions = [
    { action: 'CREATE_APP', entity: 'App', description: 'App Manaus version 4.1.0 published' },
    { action: 'CREATE_APP', entity: 'App', description: 'App Borba version 2.1.0 approved' },
    { action: 'BUILD_APPROVED', entity: 'Build', description: 'Build aprovada para SEMED versão 3.0.1' },
    { action: 'BUILD_REJECTED', entity: 'Build', description: 'Build rejeitada: Manacapuru violação de política' },
    { action: 'REVIEW_COMPLETED', entity: 'Version', description: 'Revisão concluída: Urucurituba versão 1.3.0' },
    { action: 'UPDATE_APP', entity: 'App', description: 'Política de privacidade atualizada para Tefé' },
    { action: 'CREATE_APP', entity: 'App', description: 'Novo aplicativo cadastrado: Presidente Figueiredo' },
    { action: 'BUILD_REJECTED', entity: 'Build', description: 'Versão rejeitada pela Apple: Parintins' },
    { action: 'CREATE_USER', entity: 'User', description: 'Novo usuário criado: maria.silva' },
    { action: 'UPDATE_APP', entity: 'App', description: 'Permissão alterada: app Coari' },
    { action: 'INVITE_USER', entity: 'User', description: 'Convite enviado para pedro.santos@edu.am.gov.br' },
    { action: 'BUILD_APPROVED', entity: 'Build', description: 'Nova build enviada e aprovada: Manaus' },
    { action: 'CREATE_APP', entity: 'App', description: 'App removido: Autaz Mirim (inativo)' },
  ]

  const notifications = [
    { type: 'BUILD_APPROVED' as NotificationType, title: 'Build aprovada', message: 'SEMED 3.0.1 aprovado na Google Play' },
    { type: 'BUILD_REJECTED' as NotificationType, title: 'Build rejeitada', message: 'Manacapuru rejeitado na Google Play' },
    { type: 'REJECTION' as NotificationType, title: 'Rejeição na Apple', message: 'Parintins rejeitado pela App Store' },
    { type: 'NEW_VERSION' as NotificationType, title: 'Nova versão publicada', message: 'Borba 2.1.0 publicado' },
    { type: 'SYNC_FAILURE' as NotificationType, title: 'Falha na sincronização', message: 'Erro ao sincronizar Coari' },
  ]

  for (const o of [{ org: org!, orgName: 'SAS TECH' }, { org: partnerOrg!, orgName: 'Partner TECH' }]) {
    const owner = await prisma.user.findFirst({
      where: { organizationId: o.org.id, role: UserRole.OWNER },
      select: { id: true },
    })
    if (!owner) {
      console.error(`  No owner found for org ${o.org.slug}, skipping notifications/audit`)
      continue
    }
    const ownerId = owner.id

    await prisma.auditLog.createMany({
      data: actions.map((a, i) => ({
        organizationId: o.org.id,
        userId: ownerId,
        action: a.action,
        entity: a.entity,
        entityId: 1,
        metadata: { name: a.description },
        createdAt: new Date(Date.now() - i * 3600000),
      })),
      skipDuplicates: true,
    })

    await prisma.notification.createMany({
      data: notifications.map((n, i) => ({
        organizationId: o.org.id,
        userId: ownerId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: i > 1,
        createdAt: new Date(Date.now() - i * 7200000),
      })),
    })
    console.log(`  ${actions.length} audit log entries + ${notifications.length} notifications created for ${o.orgName}`)

    const googleConnection = await prisma.storeConnection.upsert({
      where: { organizationId_store_label: { organizationId: o.org.id, store: 'GOOGLE', label: `Google Play ${o.orgName}` } },
      update: {},
      create: { organizationId: o.org.id, store: 'GOOGLE', label: `Google Play ${o.orgName}` },
    })
    await prisma.connectionConfig.upsert({
      where: { storeConnectionId: googleConnection.id },
      update: {},
      create: { storeConnectionId: googleConnection.id, encryptedData: 'mock-encrypted', iv: 'mock-iv', tag: 'mock-tag', keyVersion: 1 },
    })

    const appleConnection = await prisma.storeConnection.upsert({
      where: { organizationId_store_label: { organizationId: o.org.id, store: 'APPLE', label: `Apple Store ${o.orgName}` } },
      update: {},
      create: { organizationId: o.org.id, store: 'APPLE', label: `Apple Store ${o.orgName}` },
    })
    await prisma.connectionConfig.upsert({
      where: { storeConnectionId: appleConnection.id },
      update: {},
      create: { storeConnectionId: appleConnection.id, encryptedData: 'mock-encrypted', iv: 'mock-iv', tag: 'mock-tag', keyVersion: 1 },
    })
    console.log(`  Connections ready for ${o.orgName}`)
  }

  console.log('Seed complete (2 organizations for multi-tenant isolation testing)')
  console.log('  SAS TECH:  owner@sasi.com.br / Owner123@ | admin bruno.melo@sasi.com.br / Admin123@')
  console.log('  Partner:   alice@partner.com.br / Partner123@')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
