<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';


interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const loading = ref<boolean>(false)

const searchQuery = ref('')
const debouncedQuery = ref('')

let debounceTimer: ReturnType<typeof setTimeout>

watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newVal
  }, 300)
})

const filteredUsers = computed(() => {
  const query = debouncedQuery.value.toLowerCase().trim()
  if(!query) return users.value
  return users.value.filter(user => user.name.toLowerCase().includes(query))
})

async function fetchUsers() {
  loading.value = true
  try {
    const res = await fetch('some-url')
    if(!res.ok) throw new Error('Error fetching users')
    users.value = await res.json()
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="Search here" />

    <div v-if="loading">Cargando...</div>

    <div v-else-if="filteredUsers.length > 0">
      <div v-for="user in filteredUsers" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </div>
    </div>
    
    <div v-else>No se encontraron usuarios</div>
  </div>
</template>

<style scoped>

</style>