import { test, expect } from '@playwright/test'

test.describe('Apps Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Usuário ou e-mail').fill('bruninho')
    await page.getByPlaceholder('Senha').fill('Admin123@')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 10000 })
  })

  test('apps page loads heading', async ({ page }) => {
    await page.getByRole('link', { name: 'Apps' }).click()
    await page.waitForURL(/\/apps/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: /apps/i })).toBeVisible({ timeout: 10000 })
  })

  test('app cards link to detail pages', async ({ page }) => {
    await page.getByRole('link', { name: 'Apps' }).click()
    await page.waitForURL(/\/apps/, { timeout: 10000 })
    const appLinks = page.getByRole('link').filter({ hasText: /app|google|apple|store/i })
    const count = await appLinks.count()
    if (count > 0) {
      await appLinks.first().click()
      await page.waitForTimeout(2000)
      expect(page.url()).toContain('/apps/')
    }
  })
})
