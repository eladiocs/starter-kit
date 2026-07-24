import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserSearch from '../UserSearch.vue'

const mockUsers = [
  { id: 1, name: 'Ana Gómez', email: 'ana@example.com' },
  { id: 2, name: 'Andrés Pérez', email: 'andres@example.com' },
  { id: 3, name: 'Bruno Díaz', email: 'bruno@example.com' },
]

function mockFetchOk() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockUsers),
  }) as unknown as typeof fetch
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve(null),
  }) as unknown as typeof fetch
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Monta el componente y espera a que se resuelva el fetch inicial del onMounted
async function mountAndWaitForInitialFetch() {
  const wrapper = mount(UserSearch)
  await vi.runOnlyPendingTimersAsync()
  await wrapper.vm.$nextTick()
  return wrapper
}

describe('UserSearch - carga de usuarios desde la API', () => {
  it('muestra "Cargando..." mientras espera la respuesta', async () => {
    mockFetchOk()
    const wrapper = mount(UserSearch)
    await wrapper.vm.$nextTick()

    // Antes de resolver el fetch, debe verse el loading
    expect(wrapper.text()).toContain('Cargando...')

    await vi.runOnlyPendingTimersAsync()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Cargando...')
  })

  it('renderiza la lista de usuarios que devuelve la API', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(wrapper.text()).toContain('Ana Gómez')
    expect(wrapper.text()).toContain('andres@example.com')
  })

  it('muestra un mensaje de error si la API falla', async () => {
    mockFetchError()
    const wrapper = await mountAndWaitForInitialFetch()

    expect(wrapper.text()).toContain('Error al cargar usuarios')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})

describe('UserSearch - debounce en la búsqueda', () => {
  it('no filtra inmediatamente al escribir', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')
    await input.setValue('ana')

    // Antes de que pase el debounce, la lista no debe haberse filtrado
    expect(wrapper.findAll('li')).toHaveLength(3)
  })

  it('filtra solo después de que pasan los 300ms del debounce', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')
    await input.setValue('ana')

    await vi.advanceTimersByTimeAsync(300)
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain('Ana Gómez')
  })

  it('reinicia el debounce si el usuario sigue escribiendo antes de los 300ms', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')

    await input.setValue('a')
    await vi.advanceTimersByTimeAsync(200) // no llega a 300ms
    await input.setValue('an')            // reinicia el timer
    await vi.advanceTimersByTimeAsync(200) // aún no pasaron 300ms desde "an"

    expect(wrapper.findAll('li')).toHaveLength(3) // todavía sin filtrar

    await vi.advanceTimersByTimeAsync(100) // ahora sí se cumplen los 300ms
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('li')
    expect(items.length).toBeGreaterThan(0)
    expect(items.length).toBeLessThan(3)
  })
})

describe('UserSearch - toggle de favoritos', () => {
  it('marca un usuario como favorito al hacer click en la estrella', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const firstButton = wrapper.findAll('button')[0]!
    expect(firstButton.text()).toBe('☆') // empieza sin marcar

    await firstButton.trigger('click')

    expect(firstButton.text()).toBe('★') // ahora marcado
  })

  it('desmarca un usuario si ya era favorito', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const firstButton = wrapper.findAll('button')[0]!

    await firstButton.trigger('click') // marca
    expect(firstButton.text()).toBe('★')

    await firstButton.trigger('click') // desmarca
    expect(firstButton.text()).toBe('☆')
  })

  it('no afecta el estado de favorito de otros usuarios', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const buttons = wrapper.findAll('button')

    await buttons[0]!.trigger('click') // solo marca el primero

    expect(buttons[0]!.text()).toBe('★')
    expect(buttons[1]!.text()).toBe('☆')
    expect(buttons[2]!.text()).toBe('☆')
  })
})