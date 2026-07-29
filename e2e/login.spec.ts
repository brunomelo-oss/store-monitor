import { test, expect, type Page } from '@playwright/test'

async function login(page: Page, username = 'bruninho', password = 'Admin123@') {
  await page.getByPlaceholder('Usuário ou e-mail').fill(username)
  await page.getByPlaceholder('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

test.describe('Login Flow', () => {
  test('renders login page with logo, inputs and submit button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByAltText('SASI')).toBeVisible()
    await expect(page.getByPlaceholder('Usuário ou e-mail')).toBeVisible()
    await expect(page.getByPlaceholder('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('shows error on empty submit', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Digite seu usuário ou e-mail')).toBeVisible()
  })

  test('shows error when password is empty', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Usuário ou e-mail').fill('bruninho')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Digite sua senha')).toBeVisible()
  })

  test('logs in with mock credentials and redirects away from login', async ({ page }) => {
    await page.goto('/login')
    await login(page)
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 15000 })
    expect(page.url()).not.toContain('/login')
  })

  test('invite banner shows on email blur when API fails (mock fallback)', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('Usuário ou e-mail')
    await emailInput.fill('convidado@teste.com')
    await emailInput.blur()
    const setupBtn = page.getByText('Configurar conta')
    await expect(setupBtn).toBeVisible({ timeout: 10000 })
  })

  test('invite setup page has password fields and checklist', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('Usuário ou e-mail')
    await emailInput.fill('convidado@teste.com')
    await emailInput.blur()
    const setupBtn = page.getByText('Configurar conta')
    await setupBtn.waitFor({ timeout: 10000 })
    await setupBtn.click()
    await expect(page.getByText('Criar Senha')).toBeVisible()
    await expect(page.getByPlaceholder('Crie uma senha')).toBeVisible()
    await expect(page.getByPlaceholder('Confirmar senha')).toBeVisible()
    await page.getByPlaceholder('Crie uma senha').fill('Test123@!')
    await expect(page.getByText('Pelo menos 1 letra maiúscula')).toBeVisible()
    await expect(page.getByText('Pelo menos 1 letra minúscula')).toBeVisible()
    await expect(page.getByText('Pelo menos 1 caractere especial')).toBeVisible()
  })

  test('unauthenticated user accessing protected route eventually renders content via mock auth', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByText('Convidar Usuário')).toBeVisible({ timeout: 25000 })
    expect(page.url()).not.toContain('/login')
  })
})
