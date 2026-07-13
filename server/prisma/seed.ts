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
  const createdApps = await prisma.app.findMany({ orderBy: { sortOrder: 'asc' } })
  console.log(`  ${createdApps.length} apps created with city/state data`)

  // Create relational data for dashboard demo (sequentially to avoid pool exhaustion)
  for (const app of createdApps) {
    const hasGoogle = app.playVersion && app.playVersion !== ''
    const hasApple = app.appVersion && app.appVersion !== ''

    // Version records
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

    // Build records
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

  // Create audit log entries for dashboard timeline
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
  await prisma.auditLog.createMany({
    data: actions.map((a, i) => ({
      organizationId: org.id,
      userId: 1,
      action: a.action,
      entity: a.entity,
      entityId: 1,
      metadata: { name: a.description },
      createdAt: new Date(Date.now() - i * 3600000),
    })),
    skipDuplicates: true,
  })
  console.log(`  ${actions.length} audit log entries created`)

  // Create some notifications
  const notifications = [
    { type: 'BUILD_APPROVED' as NotificationType, title: 'Build aprovada', message: 'SEMED 3.0.1 aprovado na Google Play' },
    { type: 'BUILD_REJECTED' as NotificationType, title: 'Build rejeitada', message: 'Manacapuru rejeitado na Google Play' },
    { type: 'REJECTION' as NotificationType, title: 'Rejeição na Apple', message: 'Parintins rejeitado pela App Store' },
    { type: 'NEW_VERSION' as NotificationType, title: 'Nova versão publicada', message: 'Borba 2.1.0 publicado' },
    { type: 'SYNC_FAILURE' as NotificationType, title: 'Falha na sincronização', message: 'Erro ao sincronizar Coari' },
  ]
  await prisma.notification.createMany({
    data: notifications.map((n, i) => ({
      organizationId: org.id,
      userId: 1,
      type: n.type,
      title: n.title,
      message: n.message,
      read: i > 1,
      createdAt: new Date(Date.now() - i * 7200000),
    })),
  })
  console.log(`  ${notifications.length} notifications created`)

  const googleConnection = await prisma.storeConnection.upsert({
    where: { organizationId_store_label: { organizationId: org.id, store: 'GOOGLE', label: 'Google Play SAS TECH' } },
    update: {},
    create: { organizationId: org.id, store: 'GOOGLE', label: 'Google Play SAS TECH' },
  })
  await prisma.connectionConfig.upsert({
    where: { storeConnectionId: googleConnection.id },
    update: {},
    create: { storeConnectionId: googleConnection.id, encryptedData: 'mock-encrypted', iv: 'mock-iv', tag: 'mock-tag', keyVersion: 1 },
  })
  console.log(`  Google Play connection ready`)

  const appleConnection = await prisma.storeConnection.upsert({
    where: { organizationId_store_label: { organizationId: org.id, store: 'APPLE', label: 'Apple Store SAS TECH' } },
    update: {},
    create: { organizationId: org.id, store: 'APPLE', label: 'Apple Store SAS TECH' },
  })
  await prisma.connectionConfig.upsert({
    where: { storeConnectionId: appleConnection.id },
    update: {},
    create: { storeConnectionId: appleConnection.id, encryptedData: 'mock-encrypted', iv: 'mock-iv', tag: 'mock-tag', keyVersion: 1 },
  })
  console.log(`  Apple Store connection ready`)

  console.log('Seed complete')
  console.log('  Owner:  owner@sasi.com.br / Owner123@')
  console.log('  Admin:  bruno.melo@sasi.com.br / Admin123@')
  console.log('  Manager: manager@sasi.com.br / Manager123@')
  console.log('  Viewer: user@sasi.com.br / User123@')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
