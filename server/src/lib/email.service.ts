import { getLogger } from './logger'
import { config } from '../config'

export interface SendEmailParams {
  to: string
  subject: string
  text: string
  html?: string
}

const logger = getLogger()

async function sendViaProvider(params: SendEmailParams): Promise<void> {
  const { EMAIL_PROVIDER } = process.env

  if (!EMAIL_PROVIDER || EMAIL_PROVIDER === 'none' || EMAIL_PROVIDER === 'development') {
    logger.info(
      {
        to: params.to,
        subject: params.subject,
        bodyPreview: params.text.slice(0, 120),
      },
      '[DEV EMAIL] Would send in production:',
    )
    if (EMAIL_PROVIDER === 'none') {
      logger.warn('EMAIL_PROVIDER=none — email not sent (no provider configured)')
    }
    return
  }

  throw new Error(`EMAIL_PROVIDER "${EMAIL_PROVIDER}" is not implemented`)
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<void> {
  const subject = 'Redefinição de senha — SASI Store Monitor'
  const text = [
    'Você solicitou a redefinição da sua senha.',
    '',
    `Acesse o link abaixo para criar uma nova senha. O link expira em 30 minutos.`,
    '',
    resetLink,
    '',
    'Se você não solicitou esta alteração, ignore este e-mail.',
    '',
    '— SASI Store Monitor',
  ].join('\n')

  await sendViaProvider({ to: email, subject, text })
  logger.info({ email }, 'Password reset email sent')
}

export async function sendInviteEmail(
  email: string,
  inviteLink: string,
): Promise<void> {
  const subject = 'Convite — SASI Store Monitor'
  const text = [
    'Você foi convidado para acessar o SASI Store Monitor.',
    '',
    `Acesse o link abaixo para criar sua conta. O convite expira em 7 dias.`,
    '',
    inviteLink,
    '',
    '— SASI Store Monitor',
  ].join('\n')

  await sendViaProvider({ to: email, subject, text })
  logger.info({ email }, 'Invite email sent')
}
