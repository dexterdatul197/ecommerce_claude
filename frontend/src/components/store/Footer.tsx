import Link from 'next/link'
import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ShopNext</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Quality products delivered to your door.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-primary">Featured</Link></li>
              <li><Link href="/products?sort=price_asc" className="hover:text-primary">Best Deals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/login" className="hover:text-primary">Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary">Register</Link></li>
              <li><Link href="/orders" className="hover:text-primary">My Orders</Link></li>
              <li><Link href="/account" className="hover:text-primary">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">Help Center</span></li>
              <li><span className="cursor-default">Shipping Policy</span></li>
              <li><span className="cursor-default">Returns</span></li>
              <li><span className="cursor-default">Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ShopNext. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
