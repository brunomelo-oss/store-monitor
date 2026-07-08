import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Invite } from '@/types'
import { usersService } from '@/services/users.service'

const USERS_KEY = ['users'] as const
const INVITES_KEY = ['invites'] as const

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: usersService.list,
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
    queryFn: usersService.getInvites,
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
