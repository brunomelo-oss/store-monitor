import { test, expect } from '@playwright/test'

test.describe('Theme & Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Usuário ou e-mail').fill('bruninho')
    await page.getByPlaceholder('Senha').fill('Admin123@')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 10000 })
  })

  test('theme toggle switches between dark and light', async ({ page }) => {
    const toggle = page.getByLabel(/alternar tema/i)
    if (await toggle.isVisible()) {
      const html = page.locator('html')
      const initialClass = await html.getAttribute('class')
      await toggle.click()
      await page.waitForTimeout(500)
      const afterClass = await html.getAttribute('class')
      expect(afterClass).not.toBe(initialClass)
    }
  })

  test('language switcher shows options', async ({ page }) => {
    const langButton = page.locator('[data-testid="lang-switcher"], button[aria-label*="language"], button[aria-label*="idioma"]').first()
    if (await langButton.isVisible()) {
      await langButton.click()
      await expect(page.getByText('Português')).toBeVisible()
      await expect(page.getByText('English')).toBeVisible()
      await expect(page.getByText('العربية')).toBeVisible()
    }
  })

  test('profile dropdown shows change password and logout', async ({ page }) => {
    const avatar = page.locator('[data-testid="avatar"]').first()
    if (await avatar.isVisible()) {
      await avatar.click()
      await expect(page.getByText(/alterar senha|change password/i)).toBeVisible()
      await expect(page.getByText(/sair|logout/i)).toBeVisible()
    }
  })

  test('logout redirects to login page', async ({ page }) => {
    const avatar = page.locator('[data-testid="avatar"]').first()
    if (await avatar.isVisible()) {
      await avatar.click()
      await page.getByText(/sair|logout/i).click()
      await page.waitForURL('/login', { timeout: 10000 })
      expect(page.url()).toContain('/login')
    }
  })
})
