<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const favorites = ref<number[]>([])
const searchQuery = ref('')
const debouncedQuery = ref('')

let debounceTimer: ReturnType<typeof setTimeout>

const filteredUsers = computed(() => {
  const query = debouncedQuery.value.toLowerCase().trim()
  if (!query) return users.value
  return users.value.filter(u => u.name.toLowerCase().includes(query))
})

watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newVal
  }, 300)
})

onMounted(fetchUsers)

async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!res.ok) throw new Error('Error al cargar usuarios')
    users.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

function toggleFavorite(id: number) {
  const index = favorites.value.indexOf(id)
  if (index === -1) {
    favorites.value.push(id)
  } else {
    favorites.value.splice(index, 1)
  }
}
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="Buscar usuario..." />

    <p v-if="loading">Cargando...</p>
    <p v-else-if="error">{{ error }}</p>

    <ul v-else>
      <li v-for="user in filteredUsers" :key="user.id">
        {{ user.name }} ({{ user.email }})
        <button @click="toggleFavorite(user.id)">
          {{ favorites.includes(user.id) ? '★' : '☆' }}
        </button>
      </li>
    </ul>
  </div>
</template>