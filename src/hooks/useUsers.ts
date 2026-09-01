import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gateways } from '@/data'
import type { Role } from '@/lib/types'

export const USERS_KEY = ['users'] as const
export const INVITES_KEY = ['invites'] as const

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => gateways.users.list(),
  })
}

export function useInvites() {
  return useQuery({
    queryKey: INVITES_KEY,
    queryFn: () => gateways.users.invites(),
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => gateways.users.createInvite(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITES_KEY }),
  })
}

export function useDeleteInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.users.deleteInvite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITES_KEY }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => gateways.users.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export function useUpdatePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => gateways.users.updatePassword(id, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gateways.users.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}