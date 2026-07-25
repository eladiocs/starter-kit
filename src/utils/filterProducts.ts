import type { Product } from '@/composables/useProducts'

export interface SearchFilters {
  searchTerm?: string | number
  minPrice?: number
  category?: string
}

export function filterProducts(products: Product[], filters: SearchFilters = {}): Product[] {
  const { searchTerm, minPrice, category } = filters

  return products.filter((product) => {
    const matchesSearchTerm =
      searchTerm === undefined ||
      product.name.toLowerCase().includes(String(searchTerm).toLowerCase())

    const matchesMinPrice = minPrice === undefined || product.price >= minPrice

    const matchesCategory =
      category === undefined || product.category.toLowerCase() === category.toLowerCase()

    return matchesSearchTerm && matchesMinPrice && matchesCategory
  })
}
