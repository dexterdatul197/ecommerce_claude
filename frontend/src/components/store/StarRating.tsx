import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function StarRating({ rating, max = 5, size = 'md', className }: StarRatingProps) {
  const sz = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(sz, i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300')}
        />
      ))}
    </div>
  )
}
