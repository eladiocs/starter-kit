import { ref, type Ref } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
  imageUrl: string
}

interface UseProductsReturn {
  products: Ref<Product[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchProducts: () => Promise<void>
}

/**
 * Composable para obtener un listado de productos desde una API REST.
 * Encapsula el estado de carga/error para que cualquier componente
 * pueda reutilizarlo sin duplicar lógica.
 */
export function useProducts(apiUrl = '/api/products'): UseProductsReturn {
  const products = ref<Product[]>([]) as Ref<Product[]>
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts(): Promise<void> {
    loading.value = true
    error.value = null

    const options: RequestInit = {
      method: 'GET', //POST, PUT, DELETE
      headers: {
        'Accept': 'application/json',
        //'Content-Type': 'application/json' // Solo necesario para métodos que envían datos (POST, PUT)
      },
      //body: JSON.stringify(exampleDto) // Solo necesario para métodos que envían datos (POST, PUT)
    }

    try {
      const response = await fetch(apiUrl, options)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: no se pudieron cargar los productos`)
      }

      const data: Product[] = await response.json()
      products.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts }
}
