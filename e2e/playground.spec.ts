import { test, expect } from '@playwright/test'

test('send a mocked GET request and inspect response', async ({ page }) => {
  await page.route('https://example.test/todos/1', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, title: 'Ship it', completed: true }) })
  })
  await page.goto('/')
  await page.getByLabel('Request URL').fill('https://example.test/todos/1')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(page.getByText('200')).toBeVisible()
  await expect(page.getByText('Object {3}')).toBeVisible()
  await expect(page.getByText('Ship it')).toBeVisible()
})

test('restore a sent request from history', async ({ page }) => {
  await page.route('https://example.test/users', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1 }]) })
  })
  await page.goto('/')
  await page.getByLabel('Request URL').fill('https://example.test/users')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(page.getByText('200')).toBeVisible()
  await page.getByRole('button', { name: /History/ }).click()
  await expect(page.getByText('https://example.test/users')).toBeVisible()
  await page.getByText('https://example.test/users').click()
  await expect(page.getByLabel('Request URL')).toHaveValue('https://example.test/users')
})

test('create a JSON POST request', async ({ page }) => {
  await page.route('https://example.test/users', async (route) => {
    const body = await route.request().postDataJSON()
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ received: body }) })
  })
  await page.goto('/')
  await page.getByLabel('HTTP method').selectOption('POST')
  await page.getByLabel('Request URL').fill('https://example.test/users')
  await page.getByLabel('JSON request body').fill(JSON.stringify({ name: 'Ada', enabled: true }))
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(page.getByText('201')).toBeVisible()
  await expect(page.getByText('Ada')).toBeVisible()
})
