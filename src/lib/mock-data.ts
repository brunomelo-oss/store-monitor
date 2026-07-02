import { App, Accounts, User } from '@/types'

export const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  review: 'Em Revisão',
  rejected: 'Rejeitado',
  pending: 'Atualização Pendente',
  unpublished: 'Não Publicado',
}

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

export const MOCK_APPS: App[] = [
  { id: 1, name: 'IIN+', region: 'Brasil', googleAccount: 'sasiHoldings', appleAccount: '', playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-02-13' }, appStore: { status: 'unpublished', version: '-', lastUpdate: '' }, installations: 52000, rating: 4.2 },
  { id: 14, name: 'SASI', region: 'Brasil', googleAccount: 'sasiHoldings', appleAccount: 'sasiComunicacao', playStore: { status: 'published', version: '3.12.6', lastUpdate: '2024-10-21' }, appStore: { status: 'published', version: '3.10.1', lastUpdate: '' }, installations: 128000, rating: 4.5 },
  { id: 7, name: 'SASI PRO', region: 'Brasil', googleAccount: 'sasiHoldings', appleAccount: 'sasiComunicacao', playStore: { status: 'published', version: '4.4.10', lastUpdate: '2025-06-12' }, appStore: { status: 'published', version: '4.4.8', lastUpdate: '' }, installations: 31000, rating: 3.8 },
  { id: 5, name: 'TCE', region: 'Brasil', googleAccount: 'sasiHoldings', appleAccount: 'sasiComunicacao', playStore: { status: 'rejected', version: '1.0.5', lastUpdate: '' }, appStore: { status: 'published', version: '1.0.5', lastUpdate: '' }, installations: 18500, rating: 3.5 },
  { id: 15, name: 'SASI Console', region: 'Brasil', googleAccount: 'sasiHoldings', appleAccount: 'sasiComunicacao', playStore: { status: 'published', version: '1.0.1', lastUpdate: '2026-03-17' }, appStore: { status: 'pending', version: '1.0.1', lastUpdate: '' }, installations: 0, rating: 0 },
  { id: 4, name: 'MEU PET AM', region: 'Brasil', googleAccount: 'sasTech', appleAccount: 'sasTech', playStore: { status: 'published', version: '1.0.1', lastUpdate: '2025-06-24' }, appStore: { status: 'published', version: '1.0.0', lastUpdate: '' }, installations: 75000, rating: 4.7 },
  { id: 2, name: 'ACELERA LADÁRIO', region: 'Brasil', googleAccount: 'sasTech', appleAccount: 'sasTech', playStore: { status: 'published', version: '1.0.2', lastUpdate: '2025-07-01' }, appStore: { status: 'published', version: '1.0.0', lastUpdate: '' }, installations: 42000, rating: 4.1 },
  { id: 8, name: 'BORBA AM', region: 'Brasil', googleAccount: 'sasTech', appleAccount: 'sasTech', playStore: { status: 'rejected', version: '1.0.1', lastUpdate: '' }, appStore: { status: 'published', version: '1.0.0', lastUpdate: '' }, installations: 22000, rating: 3.2 },
  { id: 3, name: 'SEMED PVH', region: 'Brasil', googleAccount: 'sasTech', appleAccount: 'semedPvh', playStore: { status: 'published', version: '1.0.0', lastUpdate: '2025-06-30' }, appStore: { status: 'published', version: '1.0.0', lastUpdate: '' }, installations: 67000, rating: 4.4 },
  { id: 6, name: 'URUCURITUBA AM', region: 'Brasil', googleAccount: 'sasTech', appleAccount: 'sasTech', playStore: { status: 'rejected', version: '1.0.1', lastUpdate: '' }, appStore: { status: 'published', version: '1.0.0', lastUpdate: '' }, installations: 14000, rating: 3.0 },
  { id: 9, name: 'Sebrae-RO', region: 'Brasil', googleAccount: 'sasTech', appleAccount: 'sasiComunicacao', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'published', version: '1.1.2', lastUpdate: '' }, installations: 38000, rating: 4.0 },
  { id: 10, name: 'Emprega-AM', region: 'Brasil', googleAccount: 'sasiHoldings', appleAccount: 'sasTech', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 0, rating: 0 },
  { id: 11, name: 'SRG', region: 'Internacional', googleAccount: 'sasTech', appleAccount: 'sasTech', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 0, rating: 0 },
  { id: 12, name: 'Right to Food', region: 'Internacional', googleAccount: 'sasiHoldings', appleAccount: 'sasTech', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 0, rating: 0 },
  { id: 13, name: 'SALGA', region: 'Internacional', googleAccount: 'sasTech', appleAccount: 'sasTech', playStore: { status: 'unpublished', version: '', lastUpdate: '' }, appStore: { status: 'unpublished', version: '', lastUpdate: '' }, installations: 0, rating: 0 },
]

export const DEFAULT_USERS: User[] = [
  { username: 'admin', password: 'Admin123@', email: 'bruno.melo@sasi.com.br', role: 'admin' },
]

export const APP_IMAGES: Record<string, string> = {
  'IIN+': 'IIN +.png',
  'SASI': 'SASI-4.png',
  'SASI PRO': 'SASI PRO.png',
  'SASI Console': 'moni.png',
  'TCE': 'TCE - AM.png',
  'MEU PET AM': 'Meu Pet AM.png',
  'ACELERA LADÁRIO': 'Acelera Ladário.png',
  'BORBA AM': 'Borba - AM.png',
  'SEMED PVH': 'SEMED PVH.png',
  'URUCURITUBA AM': 'Urucurituba - AM.png',
  'Sebrae-RO': 'Sebrae - RO.png',
  'Emprega-AM': 'EmpregaAM.png',
  'SRG': 'SRG.png',
  'Right to Food': 'Right to Food.png',
  'SALGA': 'SALGA.png',
}
