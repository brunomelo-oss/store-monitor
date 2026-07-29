import { test, expect } from '@playwright/test'

test.describe('Admin — Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Usuário ou e-mail').fill('bruninho')
    await page.getByPlaceholder('Senha').fill('Admin123@')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 10000 })
  })

  test('navigates to admin via sidebar and shows invite section', async ({ page }) => {
    await page.getByRole('link', { name: 'Usuários' }).click()
    await page.waitForURL('/admin', { timeout: 10000 })
    await expect(page.getByText('Convidar Usuário')).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder('E-mail do usuário')).toBeVisible()
    await expect(page.getByText('Convidar')).toBeVisible()
    await expect(page.getByText('Usuários')).toBeVisible()
  })

  test('invite flow: valid email creates invite with pending status', async ({ page }) => {
    await page.getByRole('link', { name: 'Usuários' }).click()
    await page.waitForURL('/admin', { timeout: 10000 })
    await page.getByPlaceholder('E-mail do usuário').fill('novo@teste.com')
    await page.getByText('Convidar').click()
    await expect(page.getByText('novo@teste.com')).toBeVisible({ timeout: 8000 })
  })

  test('invite flow: empty email shows error toast', async ({ page }) => {
    await page.getByRole('link', { name: 'Usuários' }).click()
    await page.waitForURL('/admin', { timeout: 10000 })
    await page.getByText('Convidar').click()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
  })
})
