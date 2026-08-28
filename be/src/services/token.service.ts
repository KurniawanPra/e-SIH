import crypto from 'node:crypto'
import { config } from '../config/env'
import type { SessionUser } from '../plugins/auth'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  if (config.sessionSecret.length >= 32) {
    return config.sessionSecret.subarray(0, 32)
  }
  return crypto.createHash('sha256').update(config.sessionSecret).digest()
}

export function generateToken(user: SessionUser): string {
  const iv = crypto.randomBytes(12)
  const key = getKey()
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const payload = JSON.stringify({
    user,
    exp: Date.now() + config.cookieMaxAgeSeconds * 1000,
  })
  let encrypted = cipher.update(payload, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const authTag = cipher.getAuthTag().toString('base64')
  return `${iv.toString('base64')}.${encrypted}.${authTag}`
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [ivB64, encrypted, authTagB64] = parts
    const iv = Buffer.from(ivB64, 'base64')
    const authTag = Buffer.from(authTagB64, 'base64')
    const key = getKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    const parsed = JSON.parse(decrypted)
    if (parsed.exp && Date.now() > parsed.exp) return null
    return parsed.user || null
  } catch {
    return null
  }
}
