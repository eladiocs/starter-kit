<script setup lang="ts">
import { onMounted } from 'vue';
import { useProducts } from '@/composables/useProducts';

const { products, fetchProducts } = useProducts();

onMounted(fetchProducts);
</script>

<template>
  <div>
    <ul v-for="product in products" :key="product.id">
      <li>{{ product.name }}</li>
    </ul>
    <div class="mt-4">
      Another div
    </div>
  </div>
</template>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
</style>