import type { Metadata } from 'next'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'

export const metadata: Metadata = {
  title: { default: 'ShopNext', template: '%s | ShopNext' },
  description: 'Discover thousands of products with fast delivery, easy returns, and unbeatable prices.',
  openGraph: {
    siteName: 'ShopNext',
    type: 'website',
  },
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
