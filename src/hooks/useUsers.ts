import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Invite } from '@/types'
import { usersService } from '@/services/users.service'

interface UserRow { id: number; username: string; email: string; role: string; createdAt?: string }

const USERS_KEY = ['users'] as const
const INVITES_KEY = ['invites'] as const

const MOCK_USERS: UserRow[] = [
  { id: 10, username: 'bmelo9387', email: 'bmelo9387@gmail.com', role: 'ADMIN', createdAt: '2026-07-16T00:00:00Z' },
  { id: 2, username: 'maria.silva', email: 'maria.silva@sasi.com.br', role: 'MANAGER', createdAt: '2026-02-15T00:00:00Z' },
  { id: 3, username: 'joao.santos', email: 'joao.santos@sasi.com.br', role: 'VIEWER', createdAt: '2026-03-10T00:00:00Z' },
  { id: 4, username: 'ana.oliveira', email: 'ana.oliveira@sasi.com.br', role: 'VIEWER', createdAt: '2026-04-20T00:00:00Z' },
]

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      try {
        const data = await usersService.list()
        if (data && data.length > 0) return data as unknown as UserRow[]
      } catch {}
      return MOCK_USERS
    },
    initialData: MOCK_USERS,
    staleTime: 30_000,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password, role }: { email: string; password: string; role: string }) =>
      usersService.create(email, password, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => usersService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => usersService.updatePassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useInvites() {
  return useQuery({
    queryKey: INVITES_KEY,
    queryFn: async () => {
      try {
        const data = await usersService.getInvites()
        if (data) return data as Invite[]
      } catch {}
      return [] as Invite[]
    },
    initialData: [] as Invite[],
    staleTime: 30_000,
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => usersService.createInvite(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY })
    },
  })
}

export function useDeleteInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY })
    },
  })
}
