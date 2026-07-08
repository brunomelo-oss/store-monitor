export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string = 'Recurso') {
    super(`${entity} não encontrado`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, public provider: string, details?: Record<string, unknown>) {
    super(message, 502, 'EXTERNAL_API_ERROR', { provider, ...details })
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro de banco de dados', details?: Record<string, unknown>) {
    super(message, 503, 'DATABASE_ERROR', details)
  }
}

export class SyncError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 500, 'SYNC_ERROR', details)
  }
}

export class UnexpectedError extends AppError {
  constructor(error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro inesperado'
    super(message, 500, 'UNEXPECTED_ERROR')
    this.cause = error
  }
}
