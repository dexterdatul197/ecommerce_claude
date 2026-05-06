'use client'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/categories': 'Categories',
  '/admin/coupons': 'Coupons',
  '/admin/reviews': 'Reviews',
}

export function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const title = Object.entries(titles).reverse().find(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {session && (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white text-xs">
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  )
}
