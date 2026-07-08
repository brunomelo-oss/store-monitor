import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError, UnexpectedError } from '../lib/errors'
import { fail } from '../lib/response'
import { getLogger } from '../lib/logger'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const logger = getLogger()

  if (err instanceof AppError) {
    logger.warn({ err, path: req.path, method: req.method }, err.message)
    fail(res, err.statusCode, err.code, err.message, err.details)
    return
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
    logger.warn({ err, path: req.path, method: req.method }, 'Validation error')
    fail(res, 400, 'VALIDATION_ERROR', 'Dados inválidos', { fields: details })
    return
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')

  const unexpected = new UnexpectedError(err)
  fail(res, 500, unexpected.code, unexpected.message)
}
