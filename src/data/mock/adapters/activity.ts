import { mockActivity } from '../mock-data'
import { withLatency, clone } from '../helpers'
import type { ActivityGateway } from '../../gateways'
import type { ActivityItem } from '@/lib/types'

export const mockActivityGateway: ActivityGateway = {
  async list(opts) {
    let items: ActivityItem[] = clone(mockActivity)
    if (opts?.types && opts.types.length > 0) {
      items = items.filter(i => opts.types!.includes(i.type))
    }
    if (opts?.limit) {
      items = items.slice(0, opts.limit)
    }
    return withLatency(items)
  },
}