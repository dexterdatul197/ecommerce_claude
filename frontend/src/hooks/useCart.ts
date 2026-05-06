'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/api'
import { useCartStore } from '@/store/cart'
import type { CartSummary } from '@/types'

export function useCart() {
  const queryClient = useQueryClient()
  const setCount = useCartStore((s) => s.setCount)

  const query = useQuery<CartSummary>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
  })

  useEffect(() => {
    if (query.data) setCount(query.data.count)
  }, [query.data, setCount])

  const addItem = useMutation({
    mutationFn: (data: { product_id: number; attribute_id?: number; quantity: number }) =>
      api.post('/cart', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const updateItem = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      api.put(`/cart/${id}`, { quantity }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const removeItem = useMutation({
    mutationFn: (id: number) => api.delete(`/cart/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const clearCart = useMutation({
    mutationFn: () => api.delete('/cart').then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  return { query, addItem, updateItem, removeItem, clearCart }
}
