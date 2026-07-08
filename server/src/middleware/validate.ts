import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '../lib/errors'

type ValidationSource = 'body' | 'params' | 'query'

/**
 * Middleware factory that validates req[source] against a Zod schema.
 * On failure, throws a ValidationError with field-level details.
 */
export function validate(schema: ZodSchema, source: ValidationSource | 'all' = 'params') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (source === 'all') {
        req.body = schema.parse(req.body)
        req.params = schema.parse(req.params)
        req.query = schema.parse(req.query)
      } else {
        req[source] = schema.parse(req[source])
      }
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
        throw new ValidationError('Dados inválidos', { fields: details })
      }
      throw err
    }
  }
}
