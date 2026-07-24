import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import ProductList from '../ProductList.vue'

describe('ProductList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  }) 
  // cada test de este archivo redefine global.fetch con un mock distinto
  // (uno que nunca resuelve, uno que responde éxito, uno que responde error). 
  // Sin este beforeEach restoreAllMocks, el mock de fetch de un test podría "filtrarse" 
  // al siguiente y contaminar su resultado.

  it('muestra el estado de carga inicialmente', async () => {
    // fetch que nunca resuelve para capturar el estado "loading"
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch
    // objeto global (en Node) o window (en el navegador)
    render(ProductList)
    // render. Su trabajo es montar el componente Vue en un DOM virtual/simulado, como si el
    // navegador lo hubiera renderizado de verdad, pero dentro del entorno de test (jsdom).
    // jsdom: Es una librería de Node.js que simula un navegador sin abrir uno de verdad.
    // Implementa en JavaScript puro las APIs del DOM y del navegador (document, window,
    // document.createElement, localStorage, eventos, etc.) para que código pensado para
    // el navegador pueda ejecutarse dentro de Node, como en un test.

    // onMounted pone loading a true de forma síncrona, pero Vue aplica esa
    // actualización al DOM en un microtask, así que hay que esperarla con waitFor.
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Cargando productos...')
    })
  })

  // vi.fn: Es la función de Vitest para crear una función simulada (mock). Además de simular 
  // el comportamiento, registra automáticamente cada llamada — con qué argumentos, 
  // cuántas veces, qué devolvió.

  it('muestra la lista de productos cuando la petición tiene éxito', async () => {
    const mockProducts = [
      { id: 1, name: 'Camiseta', price: 19.99, imageUrl: '/img/1.jpg' },
      { id: 2, name: 'Pantalón', price: 39.99, imageUrl: '/img/2.jpg' },
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProducts),
      })
    ) as unknown as typeof fetch

    render(ProductList)

    // waitFor porque fetchProducts es asíncrono (sustituye a fireEvent + tick manual)
    await waitFor(() => {
      expect(screen.getByText('Camiseta')).toBeInTheDocument()
    })

    expect(screen.getByText('Pantalón')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('muestra un mensaje de error cuando la petición falla', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    ) as unknown as typeof fetch

    render(ProductList)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Error 500')
  })
})
