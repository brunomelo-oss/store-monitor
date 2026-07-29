import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Usuário ou e-mail').fill('bruninho')
    await page.getByPlaceholder('Senha').fill('Admin123@')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 10000 })
  })

  test('loads dashboard with title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/monitoramento|monitoring|activity|eventos/i)).toBeVisible({ timeout: 5000 })
  })

  test('sidebar navigation has Dashboard, Apps, Usuários, Conexões', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Apps' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usuários' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Conexões' })).toBeVisible()
  })

  test('navigates to apps page via sidebar link', async ({ page }) => {
    await page.getByRole('link', { name: 'Apps' }).click()
    await page.waitForURL(/\/apps/, { timeout: 10000 })
    expect(page.url()).toContain('/apps')
  })
})
