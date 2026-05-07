'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'
import type { WishlistItem } from '@/types'

export function useWishlist() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const query = useQuery<{ data: WishlistItem[]; product_ids: number[] }>({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then(r => r.data),
    enabled: !!session,
    staleTime: 30 * 1000,
  })

  const wishlistIds = new Set<number>(query.data?.product_ids ?? [])

  const toggle = useMutation({
    mutationFn: (productId: number) =>
      wishlistIds.has(productId)
        ? api.delete(`/wishlist/${productId}`)
        : api.post(`/wishlist/${productId}`),
    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] })
      const prev = queryClient.getQueryData(['wishlist'])
      queryClient.setQueryData(['wishlist'], (old: { data: WishlistItem[]; product_ids: number[] } | undefined) => {
        if (!old) return old
        const ids = wishlistIds.has(productId)
          ? old.product_ids.filter(id => id !== productId)
          : [...old.product_ids, productId]
        return { ...old, product_ids: ids }
      })
      return { prev }
    },
    onError: (_err, _productId, context) => {
      if (context?.prev) queryClient.setQueryData(['wishlist'], context.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })

  return { query, wishlistIds, toggle }
}
