<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProducts } from '../composables/useProducts'

//imports → interfaces → props/emits → refs/state → computed → watchers → onMounted/onUnmounted → funciones.

const { products, loading, error, fetchProducts } = useProducts()

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
  </div>
</template>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
</style>
