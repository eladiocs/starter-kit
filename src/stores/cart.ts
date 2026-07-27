import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Product {
  id: string
  name: string
  price: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<Product[]>([])

  // Getters (Computed)
  const totalPrice = computed(() => 
    items.value.reduce((acc, item) => acc + item.price, 0)
  )
  
  const itemCount = computed(() => items.value.length)

  // Actions
  function addItem(product: Product) {
    items.value.push(product)
  }

  function removeItem(productId: string) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    clearCart
  }
})