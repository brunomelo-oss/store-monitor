import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Invite } from '@/types'
import { usersService } from '@/services/users.service'
import { logError } from '@/lib/logger'

interface UserRow { id: number; username: string; email: string; role: string; createdAt?: string }

const USERS_KEY = ['users'] as const
const INVITES_KEY = ['invites'] as const

const MOCK_USERS: UserRow[] = []

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      try {
        const data = await usersService.list()
        if (data && data.length > 0) return data
      } catch (e) { logError('useUsers', e) }
      return MOCK_USERS
    },
    initialData: MOCK_USERS,
    staleTime: 30_000,
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
      } catch (e) { logError('useInvites', e) }
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
