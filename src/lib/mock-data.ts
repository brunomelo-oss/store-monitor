import type { App, Accounts, AppStatus } from '@/types'
import type { ActivityItem } from '@/services/activity.service'
import type { NotificationItem } from '@/services/notifications.service'

export const ACCOUNTS: Accounts = {
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

function s(status: string) {
  return status.toLowerCase() as AppStatus
}

export const MOCK_APPS: App[] = [
  { id: 1, name: 'Manaus', region: 'Brasil', googleAccount: 'manaus@edu.am.gov.br', appleAccount: 'manaus@gocase.com', playStatus: 'PUBLISHED', playVersion: '4.1.0', playLastUpdate: '2026-06-20T10:00:00Z', appStatus: 'PUBLISHED', appVersion: '4.1.0', appLastUpdate: '2026-06-20T10:00:00Z', playStore: { status: s('PUBLISHED'), version: '4.1.0', lastUpdate: '2026-06-20T10:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '4.1.0', lastUpdate: '2026-06-20T10:00:00Z' }, city: 'Manaus', state: 'AM', installations: 82000, rating: 4.9, pinned: true, sortOrder: 1 },
  { id: 2, name: 'SEMED', region: 'Brasil', googleAccount: 'semed@edu.am.gov.br', appleAccount: 'semed@gocase.com', playStatus: 'PUBLISHED', playVersion: '3.0.1', playLastUpdate: '2026-06-19T08:30:00Z', appStatus: 'PUBLISHED', appVersion: '3.0.1', appLastUpdate: '2026-06-19T08:30:00Z', playStore: { status: s('PUBLISHED'), version: '3.0.1', lastUpdate: '2026-06-19T08:30:00Z' }, appStore: { status: s('PUBLISHED'), version: '3.0.1', lastUpdate: '2026-06-19T08:30:00Z' }, city: 'Manaus', state: 'AM', installations: 45000, rating: 4.7, pinned: true, sortOrder: 2 },
  { id: 3, name: 'Borba', region: 'Brasil', googleAccount: 'borba@edu.am.gov.br', appleAccount: 'borba@gocase.com', playStatus: 'PUBLISHED', playVersion: '2.1.0', playLastUpdate: '2026-06-20T14:00:00Z', appStatus: 'PUBLISHED', appVersion: '2.1.0', appLastUpdate: '2026-06-20T14:00:00Z', playStore: { status: s('PUBLISHED'), version: '2.1.0', lastUpdate: '2026-06-20T14:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '2.1.0', lastUpdate: '2026-06-20T14:00:00Z' }, city: 'Borba', state: 'AM', installations: 15000, rating: 4.5, pinned: true, sortOrder: 3 },
  { id: 4, name: 'Tefé', region: 'Brasil', googleAccount: 'tefe@edu.am.gov.br', appleAccount: 'tefe@gocase.com', playStatus: 'PUBLISHED', playVersion: '2.0.0', playLastUpdate: '2026-06-18T09:15:00Z', appStatus: 'PUBLISHED', appVersion: '2.0.0', appLastUpdate: '2026-06-18T09:15:00Z', playStore: { status: s('PUBLISHED'), version: '2.0.0', lastUpdate: '2026-06-18T09:15:00Z' }, appStore: { status: s('PUBLISHED'), version: '2.0.0', lastUpdate: '2026-06-18T09:15:00Z' }, city: 'Tefé', state: 'AM', installations: 7800, rating: 4.6, pinned: false, sortOrder: 4 },
  { id: 5, name: 'Itacoatiara', region: 'Brasil', googleAccount: 'itacoatiara@edu.am.gov.br', appleAccount: 'itacoatiara@gocase.com', playStatus: 'PUBLISHED', playVersion: '1.1.0', playLastUpdate: '2026-06-15T11:00:00Z', appStatus: 'PUBLISHED', appVersion: '1.1.0', appLastUpdate: '2026-06-15T11:00:00Z', playStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-15T11:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-15T11:00:00Z' }, city: 'Itacoatiara', state: 'AM', installations: 12000, rating: 4.3, pinned: false, sortOrder: 5 },
  { id: 6, name: 'Urucurituba', region: 'Brasil', googleAccount: 'urucurituba@edu.am.gov.br', appleAccount: 'urucurituba@gocase.com', playStatus: 'REVIEW', playVersion: '1.3.0', playLastUpdate: '2026-06-18T16:00:00Z', appStatus: 'REVIEW', appVersion: '1.3.0', appLastUpdate: '2026-06-18T16:00:00Z', playStore: { status: s('REVIEW'), version: '1.3.0', lastUpdate: '2026-06-18T16:00:00Z' }, appStore: { status: s('REVIEW'), version: '1.3.0', lastUpdate: '2026-06-18T16:00:00Z' }, city: 'Urucurituba', state: 'AM', installations: 8200, rating: 4.2, pinned: false, sortOrder: 6 },
  { id: 7, name: 'Parintins', region: 'Brasil', googleAccount: 'parintins@edu.am.gov.br', appleAccount: 'parintins@gocase.com', playStatus: 'PUBLISHED', playVersion: '1.0.2', playLastUpdate: '2026-06-10T13:00:00Z', appStatus: 'REJECTED', appVersion: '1.0.2', appLastUpdate: '2026-06-10T13:00:00Z', playStore: { status: s('PUBLISHED'), version: '1.0.2', lastUpdate: '2026-06-10T13:00:00Z' }, appStore: { status: s('REJECTED'), version: '1.0.2', lastUpdate: '2026-06-10T13:00:00Z' }, city: 'Parintins', state: 'AM', installations: 9500, rating: 4.1, pinned: false, sortOrder: 7 },
  { id: 8, name: 'Maués', region: 'Brasil', googleAccount: 'maues@edu.am.gov.br', appleAccount: 'maues@gocase.com', playStatus: 'PUBLISHED', playVersion: '1.2.0', playLastUpdate: '2026-06-12T10:30:00Z', appStatus: 'PUBLISHED', appVersion: '1.2.0', appLastUpdate: '2026-06-12T10:30:00Z', playStore: { status: s('PUBLISHED'), version: '1.2.0', lastUpdate: '2026-06-12T10:30:00Z' }, appStore: { status: s('PUBLISHED'), version: '1.2.0', lastUpdate: '2026-06-12T10:30:00Z' }, city: 'Maués', state: 'AM', installations: 5400, rating: 4.4, pinned: false, sortOrder: 8 },
  { id: 9, name: 'Manacapuru', region: 'Brasil', googleAccount: 'manacapuru@edu.am.gov.br', appleAccount: 'manacapuru@gocase.com', playStatus: 'REJECTED', playVersion: '0.9.0', playLastUpdate: '2026-06-05T08:00:00Z', appStatus: 'REVIEW', appVersion: '1.0.0', appLastUpdate: '2026-06-12T08:00:00Z', playStore: { status: s('REJECTED'), version: '0.9.0', lastUpdate: '2026-06-05T08:00:00Z' }, appStore: { status: s('REVIEW'), version: '1.0.0', lastUpdate: '2026-06-12T08:00:00Z' }, city: 'Manacapuru', state: 'AM', installations: 6300, rating: 3.8, pinned: false, sortOrder: 9 },
  { id: 10, name: 'Presidente Figueiredo', region: 'Brasil', googleAccount: 'pfigueiredo@edu.am.gov.br', appleAccount: 'pfigueiredo@gocase.com', playStatus: 'REVIEW', playVersion: '1.0.0', playLastUpdate: '2026-06-22T12:00:00Z', appStatus: 'PENDING', appVersion: '', appLastUpdate: '', playStore: { status: s('REVIEW'), version: '1.0.0', lastUpdate: '2026-06-22T12:00:00Z' }, appStore: { status: s('PENDING'), version: '', lastUpdate: '' }, city: 'Presidente Figueiredo', state: 'AM', installations: 0, rating: 0, pinned: false, sortOrder: 10 },
  { id: 11, name: 'Humaitá', region: 'Brasil', googleAccount: 'humaita@edu.am.gov.br', appleAccount: 'humaita@gocase.com', playStatus: 'REJECTED', playVersion: '0.8.0', playLastUpdate: '2026-05-15T09:00:00Z', appStatus: 'PENDING', appVersion: '', appLastUpdate: '', playStore: { status: s('REJECTED'), version: '0.8.0', lastUpdate: '2026-05-15T09:00:00Z' }, appStore: { status: s('PENDING'), version: '', lastUpdate: '' }, city: 'Humaitá', state: 'AM', installations: 0, rating: 0, pinned: false, sortOrder: 11 },
  { id: 12, name: 'Tabatinga', region: 'Brasil', googleAccount: 'tabatinga@edu.am.gov.br', appleAccount: 'tabatinga@gocase.com', playStatus: 'PUBLISHED', playVersion: '1.1.0', playLastUpdate: '2026-06-12T15:00:00Z', appStatus: 'PUBLISHED', appVersion: '1.1.0', appLastUpdate: '2026-06-12T15:00:00Z', playStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-12T15:00:00Z' }, appStore: { status: s('PUBLISHED'), version: '1.1.0', lastUpdate: '2026-06-12T15:00:00Z' }, city: 'Tabatinga', state: 'AM', installations: 4100, rating: 4.0, pinned: false, sortOrder: 12 },
  { id: 13, name: 'Coari', region: 'Brasil', googleAccount: 'coari@edu.am.gov.br', appleAccount: 'coari@gocase.com', playStatus: 'PENDING', playVersion: '1.0.0', playLastUpdate: '2026-06-01T10:00:00Z', appStatus: 'UNPUBLISHED', appVersion: '', appLastUpdate: '', playStore: { status: s('PENDING'), version: '1.0.0', lastUpdate: '2026-06-01T10:00:00Z' }, appStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, city: 'Coari', state: 'AM', installations: 0, rating: 0, pinned: false, sortOrder: 13 },
  { id: 14, name: 'Lábrea', region: 'Brasil', googleAccount: 'labrea@edu.am.gov.br', appleAccount: 'labrea@gocase.com', playStatus: 'UNPUBLISHED', playVersion: '', playLastUpdate: '', appStatus: 'PENDING', appVersion: '0.5.0', appLastUpdate: '2026-05-10T11:00:00Z', playStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, appStore: { status: s('PENDING'), version: '0.5.0', lastUpdate: '2026-05-10T11:00:00Z' }, city: 'Lábrea', state: 'AM', installations: 0, rating: 0, pinned: false, sortOrder: 14 },
  { id: 15, name: 'São Gabriel da Cachoeira', region: 'Brasil', googleAccount: 'sgabriel@edu.am.gov.br', appleAccount: 'sgabriel@gocase.com', playStatus: 'UNPUBLISHED', playVersion: '', playLastUpdate: '', appStatus: 'UNPUBLISHED', appVersion: '', appLastUpdate: '', playStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, appStore: { status: s('UNPUBLISHED'), version: '', lastUpdate: '' }, city: 'São Gabriel da Cachoeira', state: 'AM', installations: 0, rating: 0, pinned: false, sortOrder: 15 },
]

export const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 3, description: 'Versão 2.1.0 do app Borba foi aprovada na Google Play', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-22T14:30:00Z' },
  { id: 'a2', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 2, description: 'Versão 3.0.1 do app SEMED foi aprovada na App Store', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-22T10:15:00Z' },
  { id: 'a3', type: 'audit_log', action: 'REJECT', entity: 'Version', entityId: 9, description: 'Versão 0.9.0 do app Manacapuru foi rejeitada na Google Play', metadata: null, userId: null, username: null, createdAt: '2026-06-21T16:00:00Z' },
  { id: 'a4', type: 'sync', action: 'SYNC', entity: 'StoreConnection', entityId: 1, description: 'Sincronização com Google Play concluída — 12 apps verificados', metadata: null, userId: null, username: null, createdAt: '2026-06-21T12:00:00Z' },
  { id: 'a5', type: 'audit_log', action: 'EDIT', entity: 'App', entityId: 10, description: 'App Presidente Figueiredo foi atualizado — nova versão enviada para revisão', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-20T18:45:00Z' },
  { id: 'a6', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 4, description: 'Versão 2.0.0 do app Tefé foi aprovada na App Store', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-20T09:30:00Z' },
  { id: 'a7', type: 'audit_log', action: 'CREATE', entity: 'App', entityId: 10, description: 'App Presidente Figueiredo foi criado', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-19T15:00:00Z' },
  { id: 'a8', type: 'sync', action: 'SYNC', entity: 'StoreConnection', entityId: 2, description: 'Sincronização com App Store concluída — 10 apps verificados', metadata: null, userId: null, username: null, createdAt: '2026-06-19T11:00:00Z' },
  { id: 'a9', type: 'audit_log', action: 'EDIT', entity: 'App', entityId: 6, description: 'App Urucurituba foi atualizado — ícone e descrição alterados', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-18T14:20:00Z' },
  { id: 'a10', type: 'audit_log', action: 'REJECT', entity: 'Version', entityId: 11, description: 'Versão 0.8.0 do app Humaitá foi rejeitada na Google Play', metadata: null, userId: null, username: null, createdAt: '2026-06-18T10:00:00Z' },
  { id: 'a11', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 5, description: 'Versão 1.1.0 do app Itacoatiara foi aprovada na Google Play', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-17T16:45:00Z' },
  { id: 'a12', type: 'audit_log', action: 'CREATE', entity: 'App', entityId: 11, description: 'App Humaitá foi criado', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-16T09:00:00Z' },
  { id: 'a13', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 8, description: 'Versão 1.0.2 do app Parintins foi aprovada na Google Play', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-15T13:30:00Z' },
  { id: 'a14', type: 'audit_log', action: 'EDIT', entity: 'App', entityId: 1, description: 'App Manaus foi atualizado — versão 4.1.0 publicada', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-15T10:00:00Z' },
  { id: 'a15', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 12, description: 'Versão 1.1.0 do app Tabatinga foi aprovada na App Store', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-14T11:15:00Z' },
  { id: 'a16', type: 'audit_log', action: 'REJECT', entity: 'Version', entityId: 7, description: 'Versão 1.0.2 do app Parintins foi rejeitada na App Store', metadata: null, userId: null, username: null, createdAt: '2026-06-13T15:00:00Z' },
  { id: 'a17', type: 'audit_log', action: 'CREATE', entity: 'App', entityId: 13, description: 'App Coari foi criado', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-12T08:00:00Z' },
  { id: 'a18', type: 'audit_log', action: 'SUCCESS', entity: 'Version', entityId: 12, description: 'Versão 1.2.0 do app Maués foi aprovada na Google Play', metadata: null, userId: 1, username: 'bruno.melo', createdAt: '2026-06-11T14:00:00Z' },
]

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, type: 'approval', title: 'App Borba aprovado', message: 'A versão 2.1.0 do app Borba foi aprovada na Google Play.', read: false, appId: 3, createdAt: '2026-06-22T14:30:00Z' },
  { id: 2, type: 'approval', title: 'App SEMED aprovado', message: 'A versão 3.0.1 do app SEMED foi aprovada na App Store.', read: false, appId: 2, createdAt: '2026-06-22T10:15:00Z' },
  { id: 3, type: 'rejection', title: 'App Manacapuru rejeitado', message: 'A versão 0.9.0 do app Manacapuru foi rejeitada na Google Play.', read: false, appId: 9, createdAt: '2026-06-21T16:00:00Z' },
  { id: 4, type: 'new_version', title: 'Nova versão enviada', message: 'O app Presidente Figueiredo enviou uma nova versão para revisão.', read: false, appId: 10, createdAt: '2026-06-20T18:45:00Z' },
  { id: 5, type: 'build', title: 'Build concluído', message: 'O build do app Tefé (v2.0.0) foi concluído com sucesso.', read: true, appId: 4, createdAt: '2026-06-20T09:00:00Z' },
]

export const MOCK_UNREAD_COUNT = { count: 4 }

export const MOCK_USERS = [
  { username: 'admin', password: 'Admin123@', email: 'bruno.melo@sasi.com.br', role: 'ADMIN' as const },
]

export const APP_IMAGES: Record<string, string> = {
  'Manaus': 'Manaus.png',
  'SEMED': 'SEMED.png',
  'Borba': 'Borba.png',
  'Tefé': 'Tefe.png',
  'Itacoatiara': 'Itacoatiara.png',
  'Urucurituba': 'Urucurituba.png',
  'Parintins': 'Parintins.png',
  'Maués': 'Maues.png',
  'Manacapuru': 'Manacapuru.png',
  'Presidente Figueiredo': 'PFigueiredo.png',
  'Humaitá': 'Humaita.png',
  'Tabatinga': 'Tabatinga.png',
  'Coari': 'Coari.png',
  'Lábrea': 'Labrea.png',
  'São Gabriel da Cachoeira': 'SGCachoeira.png',
}
