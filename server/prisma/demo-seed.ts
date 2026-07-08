import { PrismaClient, StoreType, SyncType, SyncStatus, SyncTriggerType, NotificationType, JobType, JobStatus, VersionStatus, BuildStatus, PublicationStatus, Region } from '@prisma/client'
import { hashPassword } from '../src/lib/hash'

const prisma = new PrismaClient()

const DEMO_APPS = [
  {
    name: "SEMED PVH",
    region: Region.BRASIL,
    googleAccount: "sasTech",
    appleAccount: "semedPvh",
    packageName: "br.com.semed.pvh",
    bundleId: "br.com.semed.pvh",
    playStatus: "published", playVersion: "1.2.5", playLastUpdate: "28/06/2026",
    appStatus: "published", appVersion: "1.2.3", appLastUpdate: "28/06/2026",
    installations: 67000, rating: 4.4, pinned: true, sortOrder: 1,
  },
  {
    name: "MEU PET AM",
    region: Region.BRASIL,
    googleAccount: "sasTech",
    appleAccount: "sasTech",
    packageName: "br.com.meupet.am",
    bundleId: "br.com.meupet.am",
    playStatus: "published", playVersion: "1.3.0", playLastUpdate: "24/06/2026",
    appStatus: "published", appVersion: "1.2.8", appLastUpdate: "24/06/2026",
    installations: 75000, rating: 4.7, pinned: true, sortOrder: 2,
  },
  {
    name: "ACELERA LADÁRIO",
    region: Region.BRASIL,
    googleAccount: "sasTech",
    appleAccount: "sasTech",
    packageName: "br.com.acelera.ladario",
    bundleId: "br.com.acelera.ladario",
    playStatus: "published", playVersion: "1.4.2", playLastUpdate: "01/07/2026",
    appStatus: "published", appVersion: "1.4.0", appLastUpdate: "01/07/2026",
    installations: 42000, rating: 4.1, pinned: true, sortOrder: 3,
  },
  {
    name: "BORBA AM",
    region: Region.BRASIL,
    googleAccount: "sasTech",
    appleAccount: "sasTech",
    packageName: "br.com.borba.am",
    bundleId: "br.com.borba.am",
    playStatus: "rejected", playVersion: "1.0.1", playLastUpdate: "",
    appStatus: "published", appVersion: "1.0.0", appLastUpdate: "15/06/2026",
    installations: 22000, rating: 3.2, pinned: false, sortOrder: 4,
  },
  {
    name: "URUCURITUBA AM",
    region: Region.BRASIL,
    googleAccount: "sasTech",
    appleAccount: "sasTech",
    packageName: "br.com.urucurituba.am",
    bundleId: "br.com.urucurituba.am",
    playStatus: "rejected", playVersion: "1.0.1", playLastUpdate: "",
    appStatus: "published", appVersion: "1.0.0", appLastUpdate: "10/06/2026",
    installations: 14000, rating: 3.0, pinned: false, sortOrder: 5,
  },
  {
    name: "IIN+",
    region: Region.BRASIL,
    googleAccount: "sasiHoldings",
    appleAccount: "",
    packageName: "br.com.iin.plus",
    bundleId: null,
    playStatus: "published", playVersion: "2.1.0", playLastUpdate: "13/02/2026",
    appStatus: "unpublished", appVersion: "-", appLastUpdate: "",
    installations: 52000, rating: 4.2, pinned: false, sortOrder: 6,
  },
  {
    name: "SASI",
    region: Region.BRASIL,
    googleAccount: "sasiHoldings",
    appleAccount: "sasiComunicacao",
    packageName: "br.com.sasi.app",
    bundleId: "br.com.sasi.app",
    playStatus: "published", playVersion: "4.2.1", playLastUpdate: "21/10/2024",
    appStatus: "published", appVersion: "4.0.5", appLastUpdate: "20/10/2024",
    installations: 128000, rating: 4.5, pinned: false, sortOrder: 7,
  },
  {
    name: "SASI PRO",
    region: Region.BRASIL,
    googleAccount: "sasiHoldings",
    appleAccount: "sasiComunicacao",
    packageName: "br.com.sasi.pro",
    bundleId: "br.com.sasi.pro",
    playStatus: "published", playVersion: "5.2.0", playLastUpdate: "12/06/2026",
    appStatus: "published", appVersion: "5.1.8", appLastUpdate: "12/06/2026",
    installations: 31000, rating: 3.8, pinned: false, sortOrder: 8,
  },
  {
    name: "SASI Console",
    region: Region.BRASIL,
    googleAccount: "sasiHoldings",
    appleAccount: "sasiComunicacao",
    packageName: "br.com.sasi.console",
    bundleId: "br.com.sasi.console",
    playStatus: "published", playVersion: "1.2.0", playLastUpdate: "17/03/2026",
    appStatus: "pending", appVersion: "1.2.0", appLastUpdate: "",
    installations: 0, rating: 0, pinned: false, sortOrder: 9,
  },
  {
    name: "TCE",
    region: Region.BRASIL,
    googleAccount: "sasiHoldings",
    appleAccount: "sasiComunicacao",
    packageName: "br.com.tce.app",
    bundleId: "br.com.tce.app",
    playStatus: "rejected", playVersion: "1.0.5", playLastUpdate: "",
    appStatus: "published", appVersion: "1.0.5", appLastUpdate: "05/05/2026",
    installations: 18500, rating: 3.5, pinned: false, sortOrder: 10,
  },
  {
    name: "Sebrae-RO",
    region: Region.BRASIL,
    googleAccount: "sasTech",
    appleAccount: "sasiComunicacao",
    packageName: "br.com.sebrae.ro",
    bundleId: "br.com.sebrae.ro",
    playStatus: "unpublished", playVersion: "", playLastUpdate: "",
    appStatus: "published", appVersion: "1.1.2", appLastUpdate: "20/04/2026",
    installations: 38000, rating: 4.0, pinned: false, sortOrder: 11,
  },
  {
    name: "Emprega-AM",
    region: Region.BRASIL,
    googleAccount: "sasiHoldings",
    appleAccount: "sasTech",
    packageName: "br.com.emprega.am",
    bundleId: "br.com.emprega.am",
    playStatus: "unpublished", playVersion: "", playLastUpdate: "",
    appStatus: "unpublished", appVersion: "", appLastUpdate: "",
    installations: 0, rating: 0, pinned: false, sortOrder: 12,
  },
  {
    name: "SRG",
    region: Region.INTERNACIONAL,
    googleAccount: "sasTech",
    appleAccount: "sasTech",
    packageName: "com.srg.app",
    bundleId: "com.srg.app",
    playStatus: "unpublished", playVersion: "", playLastUpdate: "",
    appStatus: "unpublished", appVersion: "", appLastUpdate: "",
    installations: 0, rating: 0, pinned: false, sortOrder: 13,
  },
  {
    name: "Right to Food",
    region: Region.INTERNACIONAL,
    googleAccount: "sasiHoldings",
    appleAccount: "sasTech",
    packageName: "org.righttofood.app",
    bundleId: "org.righttofood.app",
    playStatus: "unpublished", playVersion: "", playLastUpdate: "",
    appStatus: "unpublished", appVersion: "", appLastUpdate: "",
    installations: 0, rating: 0, pinned: false, sortOrder: 14,
  },
  {
    name: "SALGA",
    region: Region.INTERNACIONAL,
    googleAccount: "sasTech",
    appleAccount: "sasTech",
    packageName: "com.salga.app",
    bundleId: "com.salga.app",
    playStatus: "unpublished", playVersion: "", playLastUpdate: "",
    appStatus: "unpublished", appVersion: "", appLastUpdate: "",
    installations: 0, rating: 0, pinned: false, sortOrder: 15,
  },
]

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

async function main() {
  console.log('🌱 Creating demo environment...')

  const org = await prisma.organization.findFirst({ where: { slug: 'sas-tech' } })
  if (!org) { console.error('Run seed.ts first'); process.exit(1) }

  const admin = await prisma.user.findFirst({ where: { email: 'bruno.melo@sasi.com.br' } })
  if (!admin) { console.error('Admin user not found'); process.exit(1) }

  const manager = await prisma.user.findFirst({ where: { email: 'manager@sasi.com.br' } })
  if (!manager) { console.error('Manager not found'); process.exit(1) }

  const viewer = await prisma.user.findFirst({ where: { email: 'user@sasi.com.br' } })
  if (!viewer) { console.error('Viewer not found'); process.exit(1) }

  console.log('  Clearing existing demo data...')
  await prisma.job.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.syncHistory.deleteMany()
  await prisma.rejection.deleteMany()
  await prisma.review.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.analytics.deleteMany()
  await prisma.release.deleteMany()
  await prisma.track.deleteMany()
  await prisma.build.deleteMany()
  await prisma.version.deleteMany()
  await prisma.app.deleteMany()

  const googleConn = await prisma.storeConnection.findFirst({ where: { organizationId: org.id, store: 'GOOGLE' } })
  const appleConn = await prisma.storeConnection.findFirst({ where: { organizationId: org.id, store: 'APPLE' } })

  console.log('  Creating apps with full demo data...')

  for (const appData of DEMO_APPS) {
    const connId = appData.appleAccount ? appleConn?.id : googleConn?.id

    const app = await prisma.app.create({
      data: {
        ...appData,
        organizationId: org.id,
        storeConnectionId: connId ?? null,
        createdAt: daysAgo(60 + Math.floor(Math.random() * 30)),
      },
    })

    const allStores = appData.appleAccount && appData.googleAccount
      ? [StoreType.GOOGLE, StoreType.APPLE]
      : appData.appleAccount ? [StoreType.APPLE] : [StoreType.GOOGLE]

    for (const store of allStores) {
      await prisma.version.createMany({
        data: [
          { appId: app.id, store, version: '1.0.0', buildNumber: '1000', status: VersionStatus.DRAFT, createdAt: daysAgo(60) },
          { appId: app.id, store, version: '1.1.0', buildNumber: '1100', status: VersionStatus.REVIEW, createdAt: daysAgo(30) },
          { appId: app.id, store, version: '2.0.0', buildNumber: '2000', status: VersionStatus.PUBLISHED, releaseNotes: 'Correções e melhorias', createdAt: daysAgo(7) },
        ],
      })

      await prisma.build.createMany({
        data: [
          { appId: app.id, store, buildNumber: '1000.1', status: BuildStatus.APPROVED, createdAt: daysAgo(55) },
          { appId: app.id, store, buildNumber: '1100.1', status: BuildStatus.APPROVED, createdAt: daysAgo(25) },
          { appId: app.id, store, buildNumber: '2000.1', status: BuildStatus.APPROVED, createdAt: daysAgo(5) },
        ],
      })

      await prisma.analytics.createMany({
        data: Array.from({ length: 7 }, (_, di) => ({
          appId: app.id, store, date: daysAgo(6 - di),
          downloads: Math.floor(Math.random() * 300 + 10),
          installs: Math.floor(Math.random() * 500 + 10),
          impressions: Math.floor(Math.random() * 3000 + 100),
          crashes: Math.floor(Math.random() * 10),
          pageViews: Math.floor(Math.random() * 5000 + 100),
        })),
        skipDuplicates: true,
      })

      await prisma.review.createMany({
        data: Array.from({ length: 3 }, (_, ri) => ({
          appId: app.id, store,
          reviewId: `rev-${app.id}-${store}-${ri}`,
          author: `Usuário ${ri + 1}`,
          score: Math.floor(Math.random() * 5) + 1,
          title: 'Review de exemplo',
          content: 'Comentário gerado automaticamente para demonstração.',
          createdAt: daysAgo(Math.floor(Math.random() * 60)),
        })),
        skipDuplicates: true,
      })

      await prisma.rating.create({
        data: { appId: app.id, store, score: appData.rating > 0 ? appData.rating : 3.5, count: Math.max(100, Math.floor(appData.installations * 0.05)), date: daysAgo(1) },
      })
    }

    const syncTypes = Object.values(SyncType)
    const syncData = Array.from({ length: 5 + Math.floor(Math.random() * 5) }, () => {
      const type = syncTypes[Math.floor(Math.random() * syncTypes.length)]
      const isSuccess = Math.random() > 0.2
      const startedAt = daysAgo(Math.floor(Math.random() * 14))
      const completedAt = new Date(startedAt.getTime() + Math.floor(Math.random() * 120000))
      return {
        appId: app.id,
        organizationId: org.id,
        store: allStores[Math.floor(Math.random() * allStores.length)],
        type,
        status: isSuccess ? SyncStatus.SUCCESS : SyncStatus.FAILED,
        triggerType: Math.random() > 0.5 ? SyncTriggerType.SCHEDULED : SyncTriggerType.MANUAL,
        message: isSuccess ? `${type} sincronizado com sucesso` : `Falha ao sincronizar ${type}`,
        startedAt,
        completedAt: isSuccess ? completedAt : null,
        changesDetected: isSuccess ? Math.floor(Math.random() * 10) : 0,
      }
    })
    await prisma.syncHistory.createMany({ data: syncData })

    const notifTypes = Object.values(NotificationType)
    const notifData = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => {
      const type = notifTypes[Math.floor(Math.random() * notifTypes.length)]
      const isRead = Math.random() > 0.4
      return {
        appId: app.id,
        organizationId: org.id,
        userId: isRead ? (Math.random() > 0.5 ? admin.id : manager.id) : null,
        type,
        title: getNotifTitle(type, app.name),
        message: getNotifMessage(type, app.name),
        read: isRead,
        createdAt: daysAgo(Math.floor(Math.random() * 7)),
      }
    })
    await prisma.notification.createMany({ data: notifData })

    const auditData = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => {
      const actions = ['CREATE_APP', 'UPDATE_APP', 'SYNC_STARTED', 'SYNC_COMPLETED', 'VIEW_APP']
      const action = actions[Math.floor(Math.random() * actions.length)]
      return {
        organizationId: org.id,
        userId: Math.random() > 0.5 ? admin.id : manager.id,
        action,
        entity: 'App',
        entityId: app.id,
        metadata: { appName: app.name, action },
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        createdAt: daysAgo(Math.floor(Math.random() * 14)),
      }
    })
    await prisma.auditLog.createMany({ data: auditData })

    console.log(`  ✓ ${app.name}`)
  }

  console.log('  Creating background jobs...')
  for (let ji = 0; ji < 8; ji++) {
    const statuses = [JobStatus.PENDING, JobStatus.PENDING, JobStatus.SUCCESS, JobStatus.SUCCESS, JobStatus.FAILED]
    await prisma.job.create({
      data: {
        organizationId: org.id,
        type: JobType.SYNC,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        payload: { apps: DEMO_APPS.slice(0, 3).map(a => a.name) },
        triggerType: SyncTriggerType.SCHEDULED,
        createdAt: daysAgo(Math.floor(Math.random() * 3)),
        startedAt: daysAgo(Math.floor(Math.random() * 2)),
      },
    })
  }

  console.log('')
  console.log('✅ Demo environment created successfully!')
  console.log('  Users: bruno.melo@sasi.com.br / Admin123@')
  console.log(`  Apps: ${DEMO_APPS.length} created with versions, builds, releases, reviews, analytics`)
  console.log('  Sync history, notifications, audit logs, and jobs populated')
}

function getNotifTitle(type: NotificationType, appName: string): string {
  const titles: Record<NotificationType, string> = {
    NEW_VERSION: `Nova versão disponível`,
    BUILD_APPROVED: `Build aprovada`,
    BUILD_REJECTED: `Build rejeitada`,
    REVIEW_STARTED: `Revisão iniciada`,
    REVIEW_COMPLETED: `Revisão concluída`,
    REJECTION: `Rejeição`,
    APP_REMOVED: `App removido`,
    RATING_CHANGED: `Avaliação alterada`,
    SYNC_FAILURE: `Falha na sincronização`,
    INFO: `Informativo`,
  }
  return titles[type]
}

function getNotifMessage(type: NotificationType, appName: string): string {
  const messages: Record<NotificationType, string> = {
    NEW_VERSION: `${appName} possui uma nova versão disponível para publicação.`,
    BUILD_APPROVED: `O build de ${appName} foi aprovado pela loja.`,
    BUILD_REJECTED: `O build de ${appName} foi rejeitado. Verifique os requisitos.`,
    REVIEW_STARTED: `${appName} entrou em processo de revisão.`,
    REVIEW_COMPLETED: `A revisão de ${appName} foi concluída com sucesso.`,
    REJECTION: `${appName} foi rejeitado: violação de diretrizes.`,
    APP_REMOVED: `${appName} foi removido da loja.`,
    RATING_CHANGED: `A avaliação de ${appName} mudou.`,
    SYNC_FAILURE: `Falha ao sincronizar dados de ${appName}.`,
    INFO: `Atualização importante sobre ${appName}.`,
  }
  return messages[type]
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
