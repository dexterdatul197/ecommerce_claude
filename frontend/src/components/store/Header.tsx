'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { ShoppingCart, User, Search, LogOut, Package, Settings, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CartSheet } from '@/components/store/CartSheet'
import { SearchAutocomplete } from '@/components/store/SearchAutocomplete'
import { useCartStore } from '@/store/cart'
import { useWishlist } from '@/hooks/useWishlist'

export function Header() {
  const { data: session } = useSession()
  const { count, openCart } = useCartStore()
  const { wishlistIds } = useWishlist()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShopNext</span>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/products?featured=true" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Featured
            </Link>
            <Link href="/products?sort=price_asc" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Deals
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {searchOpen ? (
              <SearchAutocomplete onClose={() => setSearchOpen(false)} />
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Wishlist */}
            {session && (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistIds.size > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {wishlistIds.size > 9 ? '9+' : wishlistIds.size}
                    </span>
                  )}
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {session.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders"><Package className="mr-2 h-4 w-4" />My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist"><Heart className="mr-2 h-4 w-4" />Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account"><Settings className="mr-2 h-4 w-4" />Account</Link>
                  </DropdownMenuItem>
                  {session.user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login"><User className="mr-2 h-4 w-4" />Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <CartSheet />
    </>
  )
}
