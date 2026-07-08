import { Request, Response } from 'express'
import { healthService } from '../services'
import { ok } from '../lib/response'

export class HealthController {
  async check(req: Request, res: Response) {
    const status = await healthService.check()
    const httpStatus = status.status === 'unhealthy' ? 503 : status.status === 'degraded' ? 200 : 200
    ok(res, status, httpStatus)
  }
}
