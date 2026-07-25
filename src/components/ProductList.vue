<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProducts } from '../composables/useProducts'
import Modal from './Modal.vue'

const { products, loading, error, fetchProducts } = useProducts()

const modalVisible = ref<boolean>(false)

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div>
    <p v-if="loading" role="status">Cargando productos...</p>

    <p v-else-if="error" role="alert">{{ error }}</p>

    <ul v-else>
      <li v-for="product in products" :key="product.id">
        <span>{{ product.name }}</span>
        <span>{{ product.price }} €</span>
      </li>
    </ul>
    <button class="mt-4" type="button" @click="modalVisible = true">Abrir modal</button>
    <Modal v-model:visible="modalVisible" titulo="Modal"/>
  </div>
</template>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
</style>
