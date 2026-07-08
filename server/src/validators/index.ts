import { z } from 'zod'
import { UserRole, Region, StoreType, SyncType } from '@prisma/client'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1, 'Senha é obrigatória'),
}).refine(data => data.email || data.username, {
  message: 'Email ou username é obrigatório',
  path: ['email'],
})

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export const checkEmailSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export const appStoreInfoSchema = z.object({
  status: z.string().optional(),
  version: z.string().optional(),
  lastUpdate: z.string().optional(),
})

export const createAppSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  region: z.nativeEnum(Region).optional(),
  icon: z.string().optional(),
  packageName: z.string().optional(),
  bundleId: z.string().optional(),
  googleAccount: z.string().optional(),
  appleAccount: z.string().optional(),
  playStore: appStoreInfoSchema.optional(),
  appStore: appStoreInfoSchema.optional(),
  installations: z.number().optional(),
  rating: z.number().optional(),
  storeConnectionId: z.number().nullable().optional(),
})

export const updateAppSchema = createAppSchema.partial()

export const moveAppSchema = z.object({
  direction: z.union([z.literal(1), z.literal(-1)]),
})

export const bulkReplaceSchema = z.object({
  apps: z.array(z.object({
    name: z.string().min(1),
    region: z.nativeEnum(Region).optional(),
    googleAccount: z.string().optional(),
    appleAccount: z.string().optional(),
    playStore: appStoreInfoSchema.optional(),
    appStore: appStoreInfoSchema.optional(),
    installations: z.number().optional(),
    rating: z.number().optional(),
    sortOrder: z.number().optional(),
  })),
})

export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  role: z.nativeEnum(UserRole),
})

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
})

export const updateUserPasswordSchema = z.object({
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export const createInviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.nativeEnum(UserRole).optional(),
})

// ─── Param / Query Schemas ─────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.coerce.number({ message: 'ID deve ser um número' }),
})

export const emailParamSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

// ─── Sync Schemas ───────────────────────────────────────────────────

export const triggerSyncSchema = z.object({
  appId: z.number({ message: 'appId é obrigatório' }),
  store: z.nativeEnum(StoreType),
  types: z.array(z.nativeEnum(SyncType)).min(1, 'Pelo menos um tipo de sincronização é obrigatório'),
})

// ─── Store Connection Schemas ───────────────────────────────────────

export const createStoreConnectionSchema = z.object({
  store: z.nativeEnum(StoreType),
  label: z.string().min(1, 'Label é obrigatório').max(100),
  credentials: z.record(z.unknown(), { message: 'Credenciais são obrigatórias' }),
})

export const updateStoreConnectionSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  credentials: z.record(z.unknown()).optional(),
})
