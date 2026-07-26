<script setup lang="ts">
import { mapUser, mapUser2 } from '@/utils/mappers';
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
</style>