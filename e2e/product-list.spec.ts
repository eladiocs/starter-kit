import { test, expect } from '@playwright/test'

const mockProducts = [
  { id: 1, name: 'Camiseta', price: 19.99, imageUrl: '/img/1.jpg', category: 'Ropa' },
  { id: 2, name: 'Pantalón', price: 39.99, imageUrl: '/img/2.jpg', category: 'Ropa' },
]

test.describe('Listar productos', () => {
  test('muestra el estado de carga y luego la lista de productos', async ({ page }) => {
    // Se retrasa la respuesta para poder capturar el estado "Cargando..."
    await page.route('**/api/products', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      await route.fulfill({ status: 200, body: JSON.stringify(mockProducts) })
    })

    await page.goto('/products')

    await expect(page.getByRole('status')).toHaveText('Cargando productos...')

    await expect(page.getByRole('status')).not.toBeVisible()

    const items = page.locator('li')
    await expect(items).toHaveCount(2)
    await expect(page.getByText('Camiseta')).toBeVisible()
    await expect(page.getByText('39.99 €')).toBeVisible()
  })

  test('si la API falla, muestra un mensaje de error', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await route.fulfill({ status: 500, body: JSON.stringify({}) })
    })

    await page.goto('/products')

    await expect(page.getByRole('status')).not.toBeVisible()
    await expect(page.getByRole('alert')).toHaveText('Error 500: no se pudieron cargar los productos')
    await expect(page.locator('li')).toHaveCount(0)
  })
})
