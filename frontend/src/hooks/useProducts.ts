'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Product, Category, Review, ApiResponse, ApiMeta } from '@/types'

interface ProductFilters {
  search?: string
  category?: string
  price_min?: number
  price_max?: number
  sort?: string
  featured?: boolean
  page?: number
  per_page?: number
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<{ data: Product[]; meta: ApiMeta }>({
    queryKey: ['products', filters],
    queryFn: () =>
      api.get('/products', { params: filters }).then((r) => r.data),
  })
}

export function useProduct(slug: string) {
  return useQuery<ApiResponse<Product>>({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  })
}

export function useCategories() {
  return useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchProducts(query: string) {
  return useQuery<{ data: Product[]; meta: ApiMeta }>({
    queryKey: ['products', 'search', query],
    queryFn: () =>
      api.get('/products/search', { params: { q: query } }).then((r) => r.data),
    enabled: query.length >= 2,
  })
}

export function useProductReviews(productId: number | undefined) {
  return useQuery<{ data: Review[]; summary: { average: number; total: number }; meta: ApiMeta }>({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/products/${productId}/reviews`).then((r) => r.data),
    enabled: !!productId,
  })
}
