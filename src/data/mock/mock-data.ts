import type { ActivityItem, App, Accounts, AppStatus, User, Invite, StoreConnection, NotificationItem, SyncJob, SyncHistoryItem, HealthReport, AuthUser } from '@/lib/types'

function s(status: string): AppStatus {
  return status.toLowerCase() as AppStatus
}

export const mockAccounts: Accounts = {
  google: [
    { id: 'sasTech', name: 'SAS TECH SOLUTIONS LLC', label: '7770621952973562632' },
    { id: 'sasiHoldings', name: 'SASI Holdings Limited', label: '4956387224182688066' },
  ],
  apple: [
    { id: 'sasTech', name: 'SAS TECH SOLUTIONS LLC' },
    { id: 'semedPvh', name: 'SEMED PVH' },
    { id: 'sebraeRo', name: 'SEBRAE - RO' },
    { id: 'sasiComunicacao', name: 'SASI COMUNICACAO AGIL LTDA' },
  ],
}

export const mockCurrentUser: AuthUser = {
  id: 1,
  username: 'bruninho',
  email: 'bruninho@sasi.com.br',
  role: 'OWNER',
}

export const mockSeedUsers: User[] = [
  { id: 1, username: 'bruninho', email: 'bruninho@sasi.com.br', role: 'OWNER' },
  { id: 2, username: 'maria', email: 'maria@sasi.com.br', role: 'ADMIN' },
  { id: 3, username: 'joao', email: 'joao@sasi.com.br', role: 'MANAGER' },
  { id: 4, username: 'ana', email: 'ana@sasi.com.br', role: 'VIEWER' },
]

export const mockInvites: Invite[] = [
  { id: 1, email: 'carla@sasi.com.br', createdAt: '2026-06-20T10:00:00Z' },
  { id: 2, email: 'pedro@sasi.com.br', createdAt: '2026-06-21T09:00:00Z' },
]

export const mockApps: App[] = [
  { id: 1, name: 'Manaus', region: 'Brasil', city: 'Manaus', state: 'AM', googleAccount: 'manaus@edu.am.gov.br', appleAccount: 'manaus@gocase.com', playStore: { status: s('PUBLISHED'), version: '4.1.0', lastUpdate: '2026-06-20T10:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '4.1.0', lastUpdate: '2026-06-20T10:00:00Z' }, installations: 82000, rating: 4.9, pinned: true, sortOrder: 1 },
  { id: 2, name: 'SEMED', region: 'Brasil', city: 'Manaus', state: 'AM', googleAccount: 'semed@edu.am.gov.br', appleAccount: 'semed@gocase.com', playStore: { status: s('PUBLISHED'), version: '3.0.1', lastUpdate: '2026-06-19T08:30:00Z' }, appStore: { status: s('PUBLISHED'), version: '3.0.1', lastUpdate: '2026-06-19T08:30:00Z' }, installations: 45000, rating: 4.7, pinned: true, sortOrder: 2 },
  { id: 3, name: 'Borba', region: 'Brasil', city: 'Borba', state: 'AM', googleAccount: 'borba@edu.am.gov.br', appleAccount: 'borba@gocase.com', playStore: { status: s('PUBLISHED'), version: '2.1.0', lastUpdate: '2026-06-20T14:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '2.1.0', lastUpdate: '2026-06-20T14:00:00Z' }, installations: 15000, rating: 4.5, pinned: true, sortOrder: 3 },
  { id: 4, name: 'Tefé', region: 'Brasil', city: 'Tefé', state: 'AM', googleAccount: 'tefe@edu.am.gov.br', appleAccount: 'tefe@gocase.com', playStore: { status: s('PUBLISHED'), version: '2.0.0', lastUpdate: '2026-06-18T09:15:00Z' }, appStore: { status: s('PUBLISHED'), version: '2.0.0', lastUpdate: '2026-06-18T09:15:00Z' }, installations: 7800, rating: 4.6, pinned: false, sortOrder: 4 },
  { id: 5, name: 'Itacoatiara', region: 'Brasil', city: 'Itacoatiara', state: 'AM', googleAccount: 'itacoatiara@edu.am.gov.br', appleAccount: 'itacoatiara@gocase.com', playStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-15T11:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-15T11:00:00Z' }, installations: 12000, rating: 4.3, pinned: false, sortOrder: 5 },
  { id: 6, name: 'Urucurituba', region: 'Brasil', city: 'Urucurituba', state: 'AM', googleAccount: 'urucurituba@edu.am.gov.br', appleAccount: 'urucurituba@gocase.com', playStore: { status: s('REVIEW'), version: '1.3.0', lastUpdate: '2026-06-18T16:00:00Z' }, appStore: { status: s('REVIEW'), version: '1.3.0', lastUpdate: '2026-06-18T16:00:00Z' }, installations: 8200, rating: 4.2, pinned: false, sortOrder: 6 },
  { id: 7, name: 'Parintins', region: 'Brasil', city: 'Parintins', state: 'AM', googleAccount: 'parintins@edu.am.gov.br', appleAccount: 'parintins@gocase.com', playStore: { status: s('PUBLISHED'), version: '1.0.2', lastUpdate: '2026-06-10T13:00:00Z' }, appStore: { status: s('REJECTED'), version: '1.0.2', lastUpdate: '2026-06-10T13:00:00Z' }, installations: 9500, rating: 4.1, pinned: false, sortOrder: 7 },
  { id: 8, name: 'Maués', region: 'Brasil', city: 'Maués', state: 'AM', googleAccount: 'maues@edu.am.gov.br', appleAccount: 'maues@gocase.com', playStore: { status: s('PUBLISHED'), version: '1.2.0', lastUpdate: '2026-06-12T10:30:00Z' }, appStore: { status: s('PUBLISHED'), version: '1.2.0', lastUpdate: '2026-06-12T10:30:00Z' }, installations: 5400, rating: 4.4, pinned: false, sortOrder: 8 },
  { id: 9, name: 'Manacapuru', region: 'Brasil', city: 'Manacapuru', state: 'AM', googleAccount: 'manacapuru@edu.am.gov.br', appleAccount: 'manacapuru@gocase.com', playStore: { status: s('REJECTED'), version: '0.9.0', lastUpdate: '2026-06-05T08:00:00Z' }, appStore: { status: s('REVIEW'), version: '1.0.0', lastUpdate: '2026-06-12T08:00:00Z' }, installations: 6300, rating: 3.8, pinned: false, sortOrder: 9 },
  { id: 10, name: 'Presidente Figueiredo', region: 'Brasil', city: 'Presidente Figueiredo', state: 'AM', googleAccount: 'pfigueiredo@edu.am.gov.br', appleAccount: 'pfigueiredo@gocase.com', playStore: { status: s('REVIEW'), version: '1.0.0', lastUpdate: '2026-06-22T12:00:00Z' }, appStore: { status: s('PENDING'), version: '', lastUpdate: '' }, installations: 0, rating: 0, pinned: false, sortOrder: 10 },
  { id: 11, name: 'Humaitá', region: 'Brasil', city: 'Humaitá', state: 'AM', googleAccount: 'humaita@edu.am.gov.br', appleAccount: 'humaita@gocase.com', playStore: { status: s('REJECTED'), version: '0.8.0', lastUpdate: '2026-05-15T09:00:00Z' }, appStore: { status: s('PENDING'), version: '', lastUpdate: '' }, installations: 0, rating: 0, pinned: false, sortOrder: 11 },
  { id: 12, name: 'Tabatinga', region: 'Brasil', city: 'Tabatinga', state: 'AM', googleAccount: 'tabatinga@edu.am.gov.br', appleAccount: 'tabatinga@gocase.com', playStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-12T15:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-12T15:00:00Z' }, installations: 4100, rating: 4.0, pinned: false, sortOrder: 12 },
  { id: 13, name: 'Coari', region: 'Brasil', city: 'Coari', state: 'AM', googleAccount: 'coari@edu.am.gov.br', appleAccount: 'coari@gocase.com', playStore: { status: s('PENDING'), version: '1.0.0', lastUpdate: '2026-06-01T10:00:00Z' }, appStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, installations: 0, rating: 0, pinned: false, sortOrder: 13 },
  { id: 14, name: 'Lábrea', region: 'Brasil', city: 'Lábrea', state: 'AM', googleAccount: 'labrea@edu.am.gov.br', appleAccount: 'labrea@gocase.com', playStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, appStore: { status: s('PENDING'), version: '0.5.0', lastUpdate: '2026-05-10T11:00:00Z' }, installations: 0, rating: 0, pinned: false, sortOrder: 14 },
  { id: 15, name: 'São Gabriel da Cachoeira', region: 'Brasil', city: 'São Gabriel da Cachoeira', state: 'AM', googleAccount: 'sgabriel@edu.am.gov.br', appleAccount: 'sgabriel@gocase.com', playStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, appStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, installations: 0, rating: 0, pinned: false, sortOrder: 15 },
]

export const mockActivity: ActivityItem[] = [
  { id: 'a1', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 3, description: 'Versão 2.1.0 do app Borba foi aprovada na Google Play', username: 'bruno.melo', createdAt: '2026-06-22T14:30:00Z' },
  { id: 'a2', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 2, description: 'Versão 3.0.1 do app SEMED foi aprovada na App Store', username: 'bruno.melo', createdAt: '2026-06-22T10:15:00Z' },
  { id: 'a3', type: 'audit_log', action: 'REJECT', entity: 'Version', entityId: 9, description: 'Versão 0.9.0 do app Manacapuru foi rejeitada na Google Play', username: null, createdAt: '2026-06-21T16:00:00Z' },
  { id: 'a4', type: 'sync', action: 'SYNC', entity: 'StoreConnection', entityId: 1, description: 'Sincronização com Google Play concluída — 12 apps verificados', username: null, createdAt: '2026-06-21T12:00:00Z' },
  { id: 'a5', type: 'audit_log', action: 'EDIT', entity: 'App', entityId: 10, description: 'App Presidente Figueiredo foi atualizado — nova versão enviada para revisão', username: 'bruno.melo', createdAt: '2026-06-20T18:45:00Z' },
  { id: 'a6', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 4, description: 'Versão 2.0.0 do app Tefé foi aprovada na App Store', username: 'bruno.melo', createdAt: '2026-06-20T09:30:00Z' },
  { id: 'a7', type: 'audit_log', action: 'CREATE', entity: 'App', entityId: 10, description: 'App Presidente Figueiredo foi criado', username: 'bruno.melo', createdAt: '2026-06-19T15:00:00Z' },
  { id: 'a8', type: 'sync', action: 'SYNC', entity: 'StoreConnection', entityId: 2, description: 'Sincronização com App Store concluída — 10 apps verificados', username: null, createdAt: '2026-06-19T11:00:00Z' },
  { id: 'a9', type: 'notification', action: 'NEW_VERSION', entity: 'App', entityId: 6, description: 'App Urucurituba foi atualizado — ícone e descrição alterados', username: null, createdAt: '2026-06-18T14:20:00Z' },
]

export const mockNotifications: NotificationItem[] = [
  { id: 1, category: 'approval', priority: 'high', title: 'App Borba aprovado', message: 'A versão 2.1.0 do app Borba foi aprovada na Google Play.', read: false, appId: 3, createdAt: '2026-06-22T14:30:00Z' },
  { id: 2, category: 'approval', priority: 'high', title: 'App SEMED aprovado', message: 'A versão 3.0.1 do app SEMED foi aprovada na App Store.', read: false, appId: 2, createdAt: '2026-06-22T10:15:00Z' },
  { id: 3, category: 'rejection', priority: 'high', title: 'App Manacapuru rejeitado', message: 'A versão 0.9.0 do app Manacapuru foi rejeitada na Google Play.', read: false, appId: 9, createdAt: '2026-06-21T16:00:00Z' },
  { id: 4, category: 'new_version', priority: 'medium', title: 'Nova versão enviada', message: 'O app Presidente Figueiredo enviou uma nova versão para revisão.', read: false, appId: 10, createdAt: '2026-06-20T18:45:00Z' },
  { id: 5, category: 'build', priority: 'low', title: 'Build concluído', message: 'O build do app Tefé (v2.0.0) foi concluído com sucesso.', read: true, appId: 4, createdAt: '2026-06-20T09:00:00Z' },
  { id: 6, category: 'sync', priority: 'low', title: 'Sincronização concluída', message: 'Sincronização com Google Play concluída — 12 apps verificados.', read: true, appId: null, createdAt: '2026-06-21T12:00:00Z' },
]

export const mockSyncJobs: SyncJob[] = [
  { id: 1, appId: 1, appName: 'Manaus', store: 'GOOGLE', status: 'SUCCESS', message: 'Sincronizado com sucesso', createdAt: '2026-06-22T12:00:00Z', finishedAt: '2026-06-22T12:00:03Z' },
  { id: 2, appId: 2, appName: 'SEMED', store: 'APPLE', status: 'SUCCESS', message: 'Sincronizado com sucesso', createdAt: '2026-06-22T11:00:00Z', finishedAt: '2026-06-22T11:00:02Z' },
  { id: 3, appId: 6, appName: 'Urucurituba', store: 'GOOGLE', status: 'RUNNING', createdAt: '2026-06-21T16:00:00Z', finishedAt: null },
  { id: 4, appId: 9, appName: 'Manacapuru', store: 'APPLE', status: 'FAILED', message: 'Credencial inválida', createdAt: '2026-06-21T14:00:00Z', finishedAt: '2026-06-21T14:00:05Z' },
  { id: 5, appId: 7, appName: 'Parintins', store: 'APPLE', status: 'PARTIAL', message: 'Falha parcial em uma loja', createdAt: '2026-06-20T13:00:00Z', finishedAt: '2026-06-20T13:00:04Z' },
]

export const mockSyncHistory: SyncHistoryItem[] = [
  { id: 1, appId: 1, appName: 'Manaus', store: 'GOOGLE', status: 'SUCCESS', syncedAt: '2026-06-22T12:00:03Z' },
  { id: 2, appId: 1, appName: 'Manaus', store: 'APPLE', status: 'SUCCESS', syncedAt: '2026-06-22T12:00:03Z' },
  { id: 3, appId: 2, appName: 'SEMED', store: 'APPLE', status: 'SUCCESS', syncedAt: '2026-06-22T11:00:02Z' },
  { id: 4, appId: 9, appName: 'Manacapuru', store: 'APPLE', status: 'FAILED', message: 'Credencial inválida', syncedAt: '2026-06-21T14:00:05Z' },
  { id: 5, appId: 7, appName: 'Parintins', store: 'APPLE', status: 'PARTIAL', message: 'Falha parcial', syncedAt: '2026-06-20T13:00:04Z' },
]

export const mockConnections: StoreConnection[] = [
  { id: 1, store: 'GOOGLE', label: 'SAS TECH SOLUTIONS LLC', isActive: true, lastSyncAt: '2026-06-22T12:00:00Z' },
  { id: 2, store: 'APPLE', label: 'SASI COMUNICACAO AGIL LTDA', isActive: true, lastSyncAt: '2026-06-21T11:00:00Z' },
]

export const mockHealth: HealthReport = {
  status: 'healthy',
  uptime: 99.98,
  checks: [
    { name: 'Banco de Dados', status: 'ok', latency: 24 },
    { name: 'API', status: 'ok', latency: 18 },
    { name: 'Google Play API', status: 'ok', latency: 210 },
    { name: 'App Store Connect', status: 'ok', latency: 180 },
    { name: 'Fila de Sincronização', status: 'ok', latency: 12 },
  ],
  timestamp: '2026-06-22T12:05:00Z',
}