import type { Metadata } from 'next'
import { ProductDetailContent } from './ProductDetailContent'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

  try {
    const res = await fetch(`${apiUrl}/products/${slug}`, { next: { revalidate: 300 } })
    if (!res.ok) return { title: 'Product Not Found' }
    const json = await res.json()
    const product = json.data

    return {
      title: product.name,
      description: product.short_description ?? product.description?.slice(0, 160) ?? `Buy ${product.name} on ShopNext`,
      openGraph: {
        title: product.name,
        description: product.short_description ?? '',
        images: product.primary_image ? [{ url: product.primary_image }] : [],
        type: 'website',
      },
    }
  } catch {
    return { title: 'Product' }
  }
}

export default function ProductDetailPage() {
  return <ProductDetailContent />
}
