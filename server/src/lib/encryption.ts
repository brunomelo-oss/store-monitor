import crypto from 'crypto'
import { config } from '../config'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

export interface EncryptedData {
  encryptedData: string
  iv: string
  tag: string
  keyVersion: number
}

function getKey(keyVersion: number = 1): Buffer {
  const keyHex = config.encryption.key
  if (!keyHex) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY is not configured')
  }
  return Buffer.from(keyHex, 'hex')
}

export function encrypt(plaintext: string, keyVersion: number = 1): EncryptedData {
  const key = getKey(keyVersion)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    tag,
    keyVersion,
  }
}

export function decrypt(data: EncryptedData): string {
  const key = getKey(data.keyVersion)
  const iv = Buffer.from(data.iv, 'hex')
  const tag = Buffer.from(data.tag, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(data.encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export function rotateKey(data: EncryptedData, newKeyVersion: number): EncryptedData {
  const plaintext = decrypt(data)
  return encrypt(plaintext, newKeyVersion)
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
