'use client'
import { useState, useEffect, useCallback } from 'react'

export interface RecentProduct {
  id: number
  slug: string
  name: string
  price: number
  compare_price?: number
  primary_image?: string
  stock: number
  average_rating: number
  reviews_count: number
  category?: { name: string; slug: string }
}

const KEY = 'shopnext_recently_viewed'
const MAX = 6

function readStorage(): RecentProduct[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([])

  useEffect(() => {
    setItems(readStorage())
  }, [])

  const add = useCallback((product: RecentProduct) => {
    setItems(prev => {
      const filtered = prev.filter(p => p.id !== product.id)
      const next = [product, ...filtered].slice(0, MAX)
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  return { items, add }
}
