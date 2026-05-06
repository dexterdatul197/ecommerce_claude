'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Order, ApiMeta } from '@/types'

export function useOrders(page = 1) {
  return useQuery<{ data: Order[]; meta: ApiMeta }>({
    queryKey: ['orders', page],
    queryFn: () => api.get('/orders', { params: { page } }).then((r) => r.data),
  })
}

export function useOrder(id: number) {
  return useQuery<{ data: Order }>({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      address_id: number
      payment_method: string
      coupon_code?: string
      notes?: string
    }) => api.post('/orders', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/orders/${id}/cancel`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
