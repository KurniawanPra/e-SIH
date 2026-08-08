import 'dotenv/config'
import { z } from 'zod'

const exampleSessionSecret = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4101),
  PORTAL_API_URL: z.string().url(),
  SSO_INTERNAL_TOKEN: z.string().default(''),
  TARGET_APP_ID: z.string().uuid(),
  TARGET_FRONTEND_ORIGIN: z.string().url(),
  SESSION_SECRET_HEX: z.string().regex(/^[a-fA-F0-9]{64}$/, 'harus berupa 64 karakter hex'),
  COOKIE_NAME: z.string().min(1).default('target_session'),
  COOKIE_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(1800),
}).superRefine((env, context) => {
  if (env.NODE_ENV === 'production' && env.SESSION_SECRET_HEX === exampleSessionSecret) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SESSION_SECRET_HEX'],
      message: 'harus diganti sebelum production',
    })
  }
  if (env.NODE_ENV === 'production' && !env.TARGET_FRONTEND_ORIGIN.startsWith('https://')) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['TARGET_FRONTEND_ORIGIN'],
      message: 'harus menggunakan HTTPS pada production',
    })
  }
})

const env = envSchema.parse(process.env)

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  host: env.HOST,
  port: env.PORT,
  portalApiUrl: env.PORTAL_API_URL.replace(/\/$/, ''),
  ssoInternalToken: env.SSO_INTERNAL_TOKEN,
  appId: env.TARGET_APP_ID,
  frontendOrigin: env.TARGET_FRONTEND_ORIGIN.replace(/\/$/, ''),
  sessionSecret: Buffer.from(env.SESSION_SECRET_HEX, 'hex'),
  cookieName: env.COOKIE_NAME,
  cookieMaxAgeSeconds: env.COOKIE_MAX_AGE_SECONDS,
}
