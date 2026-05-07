'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Box, LogOut, Package, ShoppingCart, Star, Tag, Users } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badgeKey: 'pending_orders' as const },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/coupons', label: 'Coupons', icon: Package },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, badgeKey: 'pending_reviews' as const },
]

interface Badges {
  pending_orders: number
  pending_reviews: number
}

export function AdminSidebar() {
  const pathname = usePathname()

  const { data: badgesData } = useQuery<{ data: Badges }>({
    queryKey: ['admin', 'badges'],
    queryFn: () => api.get('/admin/badges').then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
  const badges = badgesData?.data

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Package className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">ShopNext</span>
        <span className="text-xs font-medium text-sidebar-foreground/60">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact, badgeKey }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const count = badgeKey && badges ? badges[badgeKey] : 0
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {count > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          ← View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
