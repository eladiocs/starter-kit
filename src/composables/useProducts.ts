import { ref, type Ref } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
  imageUrl: string
  category: string
}

interface UseProductsReturn {
  products: Ref<Product[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchProducts: () => Promise<void>
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Teclado mecánico RGB', price: 59.99, imageUrl: 'https://picsum.photos/seed/teclado/200', category: 'Periféricos' },
  { id: 2, name: 'Mouse inalámbrico', price: 24.5, imageUrl: 'https://picsum.photos/seed/mouse/200', category: 'Periféricos' },
  { id: 3, name: 'Monitor 27" 4K', price: 349.0, imageUrl: 'https://picsum.photos/seed/monitor/200', category: 'Monitores' },
  { id: 4, name: 'Auriculares Bluetooth', price: 45.0, imageUrl: 'https://picsum.photos/seed/auriculares/200', category: 'Audio' },
  { id: 5, name: 'Webcam Full HD', price: 32.99, imageUrl: 'https://picsum.photos/seed/webcam/200', category: 'Periféricos' },
  { id: 6, name: 'Silla ergonómica', price: 189.0, imageUrl: 'https://picsum.photos/seed/silla/200', category: 'Mobiliario' },
  { id: 7, name: 'SSD NVMe 1TB', price: 79.99, imageUrl: 'https://picsum.photos/seed/ssd/200', category: 'Almacenamiento' },
  { id: 8, name: 'Hub USB-C 7 en 1', price: 29.99, imageUrl: 'https://picsum.photos/seed/hub/200', category: 'Accesorios' },
]


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

      products.value = await response.json()

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      products.value = MOCK_PRODUCTS
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts }
}
