import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserList from '../UserList.vue'

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
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Monta el componente y espera a que se resuelva el fetch inicial del onMounted
async function mountAndWaitForInitialFetch() {
  const wrapper = mount(UserList)
  await vi.runOnlyPendingTimersAsync()
  await wrapper.vm.$nextTick()
  return wrapper
}

describe('UserList - carga de usuarios desde la API', () => {
  it('muestra "Cargando..." mientras espera la respuesta', async () => {
    mockFetchOk()
    const wrapper = mount(UserList)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando...')

    await vi.runOnlyPendingTimersAsync()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Cargando...')
  })

  it('renderiza la lista de usuarios que devuelve la API', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    expect(wrapper.text()).toContain('Ana Gómez')
    expect(wrapper.text()).toContain('andres@example.com')
    expect(wrapper.text()).toContain('Bruno Díaz')
    expect(wrapper.text()).not.toContain('No se encontraron usuarios')
  })

  it('muestra "No se encontraron usuarios" si la API falla', async () => {
    mockFetchError()
    const wrapper = await mountAndWaitForInitialFetch()

    expect(wrapper.text()).toContain('No se encontraron usuarios')
  })
})

describe('UserList - búsqueda con debounce', () => {
  it('no filtra inmediatamente al escribir', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')
    await input.setValue('ana')

    // Antes de que pase el debounce, la lista no debe haberse filtrado
    expect(wrapper.text()).toContain('Bruno Díaz')
  })

  it('filtra solo después de que pasan los 300ms del debounce', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')
    await input.setValue('ana')

    await vi.advanceTimersByTimeAsync(300)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Ana Gómez')
    expect(wrapper.text()).not.toContain('Andrés Pérez')
    expect(wrapper.text()).not.toContain('Bruno Díaz')
  })

  it('reinicia el debounce si el usuario sigue escribiendo antes de los 300ms', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')

    await input.setValue('a')
    await vi.advanceTimersByTimeAsync(200) // no llega a 300ms
    await input.setValue('an')            // reinicia el timer
    await vi.advanceTimersByTimeAsync(200) // aún no pasaron 300ms desde "an"

    expect(wrapper.text()).toContain('Bruno Díaz') // todavía sin filtrar

    await vi.advanceTimersByTimeAsync(100) // ahora sí se cumplen los 300ms
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Bruno Díaz')
  })

  it('muestra "No se encontraron usuarios" cuando la búsqueda no tiene coincidencias', async () => {
    mockFetchOk()
    const wrapper = await mountAndWaitForInitialFetch()

    const input = wrapper.find('input')
    await input.setValue('xyz-inexistente')

    await vi.advanceTimersByTimeAsync(300)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No se encontraron usuarios')
  })
})
