import { create } from 'zustand'

interface CartStore {
  isOpen: boolean
  count: number
  openCart: () => void
  closeCart: () => void
  setCount: (n: number) => void
}

export const useCartStore = create<CartStore>((set) => ({
  isOpen: false,
  count: 0,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setCount: (count) => set({ count }),
}))
