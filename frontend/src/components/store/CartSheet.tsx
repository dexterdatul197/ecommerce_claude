'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { useCart } from '@/hooks/useCart'

export function CartSheet() {
  const { isOpen, closeCart } = useCartStore()
  const { query, updateItem, removeItem } = useCart()

  const cart = query.data

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Your Cart
            {cart && <span className="text-sm font-normal text-muted-foreground">({cart.count} items)</span>}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {query.isLoading ? (
            <div className="space-y-4 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !cart || cart.data.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add products to get started</p>
              </div>
              <Button asChild onClick={closeCart}>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {cart.data.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-gray-50">
                        {item.product.primary_image ? (
                          <Image src={item.product.primary_image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="line-clamp-1 text-sm font-medium hover:underline"
                            onClick={closeCart}
                          >
                            {item.product.name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeItem.mutate(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {item.attribute && (
                          <p className="text-xs text-muted-foreground">
                            {item.attribute.name}: {item.attribute.value}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold">{formatCurrency(item.total_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping & taxes calculated at checkout</p>
                <Button asChild className="w-full" onClick={closeCart}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={closeCart}>
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
