import { mockHealth } from '../mock-data'
import { withLatency, clone } from '../helpers'
import type { HealthGateway } from '../../gateways'

export const mockHealthGateway: HealthGateway = {
  async check() {
    return withLatency(clone(mockHealth))
  },
}