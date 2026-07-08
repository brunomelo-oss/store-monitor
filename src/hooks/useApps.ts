import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from '@/types'
import { appsService } from '@/services/apps.service'

const APPS_KEY = ['apps'] as const

export function useApps() {
  return useQuery({
    queryKey: APPS_KEY,
    queryFn: appsService.list,
    staleTime: 30_000,
  })
}

export function useApp(id: number) {
  return useQuery({
    queryKey: [...APPS_KEY, id] as const,
    queryFn: () => appsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<App>) => appsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY })
    },
  })
}

export function useUpdateApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<App> }) => appsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY })
    },
  })
}

export function useDeleteApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => appsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY })
    },
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => appsService.togglePin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY })
    },
  })
}

export function useMoveApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: 1 | -1 }) => appsService.move(id, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY })
    },
  })
}

export function useBulkReplace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (apps: Partial<App>[]) => appsService.bulkReplace(apps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY })
    },
  })
}
