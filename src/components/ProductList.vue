<script setup lang="ts">
import { onMounted } from 'vue'
import { useProducts } from '../composables/useProducts'

const { products, loading, error, fetchProducts } = useProducts()

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="product-list">
    <p v-if="loading" role="status">Cargando productos...</p>

    <p v-else-if="error" role="alert">{{ error }}</p>

    <ul v-else>
      <li v-for="product in products" :key="product.id">
        <span>{{ product.name }}</span>
        <span>{{ product.price }} €</span>
      </li>
    </ul>
  </div>
</template>
