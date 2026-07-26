<script setup lang="ts">
import { mapUser, mapUser2 } from '@/utils/mappers';
import { computed, onMounted, ref, watch } from 'vue';
import Modal from './Modal.vue';


interface User {
  id: number
  name: string
  email: string
}

interface FormState {
  name: string
  email: string
}

interface FormTouched {
  name: boolean
  email: boolean
}

const users = ref<User[]>([])
const loading = ref<boolean>(false)

const searchQuery = ref<string>('')
const debouncedQuery = ref<string>('')

const modalVisible = ref<boolean>(false)
const creating = ref<boolean>(false)
const createError = ref<string>('')

const form = ref<FormState>({
  name: '',
  email: '',
})

// Tracks which fields the user already touched (blur) so we don't show
// errors too early.
const touched = ref<FormTouched>({
  name: false,
  email: false,
})

const errors = ref<Partial<Record<keyof FormState, string>>>({})

let debounceTimer: ReturnType<typeof setTimeout>

watch(searchQuery, (newVal: string) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newVal
  }, 300)
})

const filteredUsers = computed<User[]>(() => {
  const query = debouncedQuery.value.toLowerCase().trim()
  if(!query) return users.value
  return users.value.filter((user: User) => user.name.toLowerCase().includes(query))
})

async function fetchUsers(): Promise<void> {
  loading.value = true
  try {
    const res = await fetch('/api/users')

    if(!res.ok) throw new Error('Error fetching users')
    users.value = (await res.json()).map(mapUser)

  } catch(e) {
    console.error(e)

  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

function abrirModalCrear(): void {
  form.value.name = ''
  form.value.email = ''
  touched.value.name = false
  touched.value.email = false
  errors.value = {}
  createError.value = ''
  modalVisible.value = true
}

function validate(): boolean {
  const result: Partial<Record<keyof FormState, string>> = {}

  if (!form.value.name) result.name = 'El nombre es obligatorio.'
  else if (form.value.name.trim().length < 3) result.name = 'Mínimo 3 caracteres.'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) result.email = 'El email es obligatorio.'
  else if (!emailRegex.test(form.value.email)) result.email = 'Email inválido.'

  errors.value = result

  return Object.keys(result).length === 0
}

function markTouched(field: keyof FormTouched): void {
  touched.value[field] = true
  validate()
}

// Once at least one field has been touched, keep revalidating live so an
// error clears the moment the user fixes it, instead of waiting for the
// next blur or submit.
watch(form, () => {
    const anyTouched = (Object.keys(touched.value) as (keyof FormTouched)[]).some((field) => touched.value[field])
    if (anyTouched) validate()
  },
  { deep: true },
)

async function crearUsuario(): Promise<void> {
  createError.value = ''

  // On submit, mark everything as touched so all errors show up if the user tried to skip fields.
  const fields = Object.keys(touched.value) as (keyof FormTouched)[]
  fields.forEach((field) => {
    touched.value[field] = true
  })

  if (!validate()) return

  creating.value = true
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_name: form.value.name, email: form.value.email })
    })

    if (!res.ok) throw new Error('Error al crear el usuario')

    modalVisible.value = false
    await fetchUsers()
  } catch (e) {
    console.error(e)
    createError.value = 'No se pudo crear el usuario'
  } finally {
    creating.value = false
  }
}

</script>

<template>
  <div>
    <input class="mb-4" v-model="searchQuery" placeholder="Search here" />

    <div v-if="loading">Cargando...</div>

    <div v-else-if="filteredUsers.length > 0">
      <div v-for="user in filteredUsers" :key="user.id">
        {{ user.name }} - {{ user.email }}
        <!-- {{ user.name }}  versión mapUser2 donde name incluye email -->
      </div>
    </div>

    <div v-else>No se encontraron usuarios</div>

    <button class="mt-4" type="button" @click="abrirModalCrear">Nuevo usuario</button>

    <Modal v-model:visible="modalVisible" titulo="Nuevo usuario">
      <form @submit.prevent="crearUsuario">
        <div class="campo">
          <label for="nombre">Nombre</label>
          <input id="nombre" v-model="form.name" @blur="markTouched('name')" />
          <p v-if="touched.name && errors.name" class="error">{{ errors.name }}</p>
        </div>
        <div class="campo">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="form.email" @blur="markTouched('email')" />
          <p v-if="touched.email && errors.email" class="error">{{ errors.email }}</p>
        </div>
        <p v-if="createError" role="alert">{{ createError }}</p>
      </form>

      <template #footer>
        <button type="button" @click="modalVisible = false">Cancelar</button>
        <button type="button" :disabled="creating" @click="crearUsuario">
          {{ creating ? 'Creando...' : 'Crear' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
  width: 100%;
  max-width: 320px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  box-sizing: border-box;
}
.mt-4 {
  margin-top: 1rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}
.campo input {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}
</style>