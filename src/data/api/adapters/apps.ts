import { apiClient } from '@/data/api-client'
import type { AppsGateway, AppInput } from '../../gateways'
import type { App, Accounts } from '@/lib/types'

export const apiAppsGateway: AppsGateway = {
  list() {
    return apiClient<App[]>('/apps')
  },
  getById(id) {
    return apiClient<App>(`/apps/${id}`)
  },
  create(input: AppInput) {
    return apiClient<App>('/apps', { method: 'POST', body: JSON.stringify(input) })
  },
  update(id, input) {
    return apiClient<App>(`/apps/${id}`, { method: 'PUT', body: JSON.stringify(input) })
  },
  remove(id) {
    return apiClient<void>(`/apps/${id}`, { method: 'DELETE' })
  },
  togglePin(id) {
    return apiClient<App>(`/apps/${id}/pin`, { method: 'PATCH' })
  },
  move(id, direction) {
    return apiClient<App[]>(`/apps/${id}/move`, { method: 'PATCH', body: JSON.stringify({ direction }) })
  },
  getAccounts() {
    return apiClient<Accounts>('/apps/accounts')
  },
}