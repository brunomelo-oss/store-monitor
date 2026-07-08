import { Response } from 'express'

interface SuccessResponse<T = unknown> {
  success: true
  data: T
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

export function ok<T>(res: Response, data: T, status: number = 200): void {
  const body: SuccessResponse<T> = { success: true, data }
  res.status(status).json(body)
}

export function created<T>(res: Response, data: T): void {
  ok(res, data, 201)
}

export function noContent(res: Response): void {
  res.status(204).end()
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  const body: ErrorResponse = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  }
  res.status(status).json(body)
}
