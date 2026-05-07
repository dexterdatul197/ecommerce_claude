'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/hooks/useCart'
import { usePlaceOrder } from '@/hooks/useOrders'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import type { Address } from '@/types'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponFromCart = searchParams.get('coupon') ?? ''
  const { query: cartQuery } = useCart()
  const placeOrder = usePlaceOrder()
  const { toast } = useToast()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState(couponFromCart)
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', line1: '', city: '', state: '', zip: '', country: 'US' })
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/addresses').then(r => {
      const addrs: Address[] = r.data.data
      setAddresses(addrs)
      const def = addrs.find(a => a.is_default) ?? addrs[0]
      if (def) setSelectedAddressId(def.id)
      if (addrs.length === 0) setShowNewForm(true)
    })
  }, [])

  const cart = cartQuery.data
  const subtotal = cart?.subtotal ?? 0
  const shipping = 5
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  async function handleAddAddress() {
    setLoading(true)
    try {
      const res = await api.post('/addresses', { ...newAddress, type: 'shipping', is_default: addresses.length === 0 })
      const addr: Address = res.data.data
      setAddresses(prev => [...prev, addr])
      setSelectedAddressId(addr.id)
      setShowNewForm(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save address.'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast({ title: 'Error', description: 'Please select a shipping address.', variant: 'destructive' })
      return
    }
    placeOrder.mutate(
      { address_id: selectedAddressId, payment_method: paymentMethod, coupon_code: couponCode || undefined },
      {
        onSuccess: (data) => {
          router.push(`/orders/confirmation?id=${data.data.id}`)
        },
        onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      }
    )
  }

  if (cartQuery.isLoading) return (
    <div className="container max-w-4xl py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  )

  if (!cart || cart.data.length === 0) return (
    <div className="container py-24 text-center">
      <p className="text-lg text-muted-foreground">Your cart is empty.</p>
      <Button asChild className="mt-4"><Link href="/products">Shop Now</Link></Button>
    </div>
  )

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Address + Payment */}
        <div className="space-y-4">
          {/* Shipping Address */}
          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {addresses.map((addr) => (
                <label key={addr.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}>
                  <input type="radio" name="address" className="mt-1" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                  <div className="text-sm">
                    <p className="font-medium">{addr.name}</p>
                    <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                    <p className="text-muted-foreground">{addr.phone}</p>
                  </div>
                </label>
              ))}

              {!showNewForm ? (
                <Button variant="outline" size="sm" onClick={() => setShowNewForm(true)}>+ Add New Address</Button>
              ) : (
                <div className="space-y-3 rounded-lg border p-3">
                  <h3 className="text-sm font-semibold">New Address</h3>
                  {[
                    { field: 'name', label: 'Full Name', placeholder: 'John Doe' },
                    { field: 'phone', label: 'Phone', placeholder: '+1 555-0000' },
                    { field: 'line1', label: 'Street Address', placeholder: '123 Main St' },
                    { field: 'city', label: 'City', placeholder: 'New York' },
                    { field: 'state', label: 'State', placeholder: 'NY' },
                    { field: 'zip', label: 'ZIP', placeholder: '10001' },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={field} className="text-xs">{label}</Label>
                      <Input id={field} placeholder={placeholder} value={(newAddress as Record<string, string>)[field]} onChange={(e) => setNewAddress(a => ({ ...a, [field]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddAddress} disabled={loading}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'stripe', label: 'Credit / Debit Card (Stripe)' },
              ].map(({ value, label }) => (
                <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${paymentMethod === value ? 'border-primary bg-primary/5' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Order summary */}
        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cart.data.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1">{item.product.name} × {item.quantity}</span>
                  <span className="ml-4 shrink-0 font-medium">{formatCurrency(item.total_price)}</span>
                </div>
              ))}

              <div className="space-y-1">
                <Label htmlFor="coupon" className="text-xs">Coupon Code</Label>
                <Input id="coupon" placeholder="WELCOME10" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="uppercase" />
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(shipping)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={placeOrder.isPending}>
                {placeOrder.isPending ? 'Placing Order…' : (
                  <><CheckCircle className="mr-2 h-5 w-5" />Place Order</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
