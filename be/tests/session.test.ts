import assert from 'node:assert/strict'
import { test } from 'node:test'
import { api, getCurrentUser, exchangeSsoToken, runtimeConfig } from '../../fe/src/lib/api'

const user = { sub: 'portal-user', name: 'Local Test', employeeId: 'employee-test' }
const appId = '11111111-1111-4111-8111-111111111111'

function response(config: any, data: any) {
  return { config, status: 200, statusText: 'OK', headers: {}, data }
}

test('Session checks distinguish logged-out users from backend and access failures', async () => {
  const original = api.defaults.adapter
  try {
    api.defaults.adapter = async config => response(config, { success: true, data: null })
    assert.equal(await getCurrentUser(), null)
    for (const status of [401, 403, 503]) {
      const failure = Object.assign(new Error('session unavailable'), { isAxiosError: true, response: { status }, config: { url: '/api/auth/me' } })
      api.defaults.adapter = async () => { throw failure }
      if (status === 401) assert.equal(await getCurrentUser(), null)
      else await assert.rejects(getCurrentUser(), error => error === failure)
    }
  } finally { api.defaults.adapter = original }
})

test('SSO navigation requires a matching cookie session, not just a successful exchange', async () => {
  const original = api.defaults.adapter
  const originalAppId = runtimeConfig.targetAppId
  const originalPortalUrl = runtimeConfig.portalUrl
  runtimeConfig.targetAppId = appId
  runtimeConfig.portalUrl = 'https://portal.test'
  try {
    for (const session of [null, { ...user, sub: 'another-user' }, user]) {
      const calls: string[] = []
      api.defaults.adapter = async config => {
        calls.push(config.url!)
        return response(config, { success: true, data: config.url === '/api/auth/login' ? { user } : session })
      }
      if (!session) await assert.rejects(exchangeSsoToken('one-use-token'), /Sesi login tidak terbaca/)
      else if (session.sub !== user.sub) await assert.rejects(exchangeSsoToken('one-use-token'), /Identitas sesi tidak sesuai/)
      else assert.equal((await exchangeSsoToken('one-use-token')).sub, user.sub)
      assert.deepEqual(calls, ['/api/auth/login', '/api/auth/me'])
    }
  } finally {
    api.defaults.adapter = original
    runtimeConfig.targetAppId = originalAppId
    runtimeConfig.portalUrl = originalPortalUrl
  }
})

test('Blocked localStorage/sessionStorage do not prevent cookie authentication', async () => {
  const originalAdapter = api.defaults.adapter
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const originalFetch = globalThis.fetch
  const fakeWindow = { location: { hostname: 'localhost', pathname: '/sso-callback' } }
  for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(fakeWindow, key, {
    get() { throw new Error('Storage access denied') },
  })
  Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true })
  globalThis.fetch = async () => new Response(JSON.stringify({ apiUrl: '', targetAppId: appId, portalUrl: 'https://portal.test' }), { headers: { 'Content-Type': 'application/json' } })
  try {
    api.defaults.adapter = async config => response(config, { success: true, data: config.url === '/api/auth/login' ? { user } : user })
    assert.equal((await exchangeSsoToken('one-use-token')).sub, user.sub)
  } finally {
    api.defaults.adapter = originalAdapter
    globalThis.fetch = originalFetch
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
