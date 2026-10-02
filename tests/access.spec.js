import { test, expect } from '@playwright/test'
const user = { id: '00000000-0000-4000-8000-000000000001', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }

async function mockBackend(page, { companies = ['Meet & Eat'], accessError = false } = {}) {
  const jobs = [], unexpected = []
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.hostname.endsWith('supabase.co')) {
      if (url.pathname === '/auth/v1/token') {
        const expiresAt = Math.floor(Date.now() / 1000) + 3600
        const token = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: user.id, role: 'authenticated', exp: expiresAt })).toString('base64url'), 'test-signature-not-a-real-credential'].join('.')
        return route.fulfill({ json: { access_token: token, refresh_token: 'test-refresh-not-a-real-credential', token_type: 'bearer', expires_in: 3600, expires_at: expiresAt, user } })
      }
      if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204 })
      if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user })
      if (url.pathname === '/rest/v1/rpc/get_job_requisition_access') return route.fulfill({ status: accessError ? 403 : 200, json: accessError ? { message: 'denied' } : companies })
      if (url.pathname === '/rest/v1/job_requisitions') {
        jobs.push({ method: route.request().method(), hasBearer: route.request().headers().authorization?.startsWith('Bearer ') })
        return route.fulfill({ json: [] })
      }
      unexpected.push(url.pathname)
      return route.abort()
    }
    if (url.hostname.includes('emailjs')) { unexpected.push('emailjs'); return route.abort() }
    return route.continue()
  })
  return { jobs, unexpected }
}
async function login(page) {
  await page.getByLabel('E-mail', { exact: true }).fill(user.email)
  await page.getByLabel('Senha', { exact: true }).fill('fixture-password')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}
test('anonymous visitor sees login and makes no job requests', async ({ page }) => {
  const network = await mockBackend(page)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible()
  await expect(page.locator('select[name="empresa"]')).toHaveCount(0)
  expect(network.jobs).toEqual([]); expect(network.unexpected).toEqual([])
})
test('session without authorized company cannot mount requisition or job list', async ({ page }) => {
  const network = await mockBackend(page, { companies: [] })
  await page.goto('/'); await login(page)
  await expect(page.getByRole('alert')).toContainText('não tem acesso')
  await expect(page.locator('select[name="empresa"]')).toHaveCount(0)
  expect(network.jobs).toEqual([]); expect(network.unexpected).toEqual([])
})
test('authorized manager sees only their company and signout clears privileged UI', async ({ page }) => {
  const network = await mockBackend(page)
  await page.goto('/'); await login(page)
  await expect(page.locator('select[name="empresa"]')).toBeVisible()
  expect(await page.locator('select[name="empresa"] option:not([disabled])').allTextContents()).toEqual(['Meet & Eat'])
  await page.getByRole('button', { name: /Banco de Vagas/ }).click()
  await expect(page.getByText('Nenhuma requisição', { exact: true })).toBeVisible()
  expect(network.jobs.length).toBeGreaterThan(0)
  expect(network.jobs.every(request => request.method === 'GET' && request.hasBearer)).toBeTruthy()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeVisible()
  await expect(page.getByText('Nenhuma requisição', { exact: true })).toHaveCount(0)
  expect(network.unexpected).toEqual([])
})
test('authorization lookup error fails closed without job requests', async ({ page }) => {
  const network = await mockBackend(page, { accessError: true })
  await page.goto('/'); await login(page)
  await expect(page.getByRole('alert')).toContainText('Não foi possível verificar suas permissões')
  expect(network.jobs).toEqual([]); expect(network.unexpected).toEqual([])
})
