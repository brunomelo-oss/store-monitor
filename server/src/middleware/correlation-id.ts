import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

export function correlationId(req: Request, _res: Response, next: NextFunction): void {
  req.correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID()
  next()
}
