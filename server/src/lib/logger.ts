import pino from 'pino'

let _logger: pino.Logger | null = null

export function createLogger(): pino.Logger {
  if (_logger) return _logger

  const isDev = (process.env.NODE_ENV ?? 'development') !== 'production'

  _logger = pino({
    level: isDev ? 'debug' : 'info',
    ...(isDev
      ? {
          transport: {
            target: 'pino/file',
            options: { destination: 1 },
          },
        }
      : {
          formatters: {
            level(label) {
              return { level: label }
            },
          },
        }),
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
      censor: '[REDACTED]',
    },
  })

  return _logger
}

export function getLogger(): pino.Logger {
  if (!_logger) {
    return createLogger()
  }
  return _logger
}

export { pino }
