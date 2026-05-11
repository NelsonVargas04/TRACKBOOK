import { Star } from 'lucide-react'

export function Stars({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < count ? '#f59e0b' : 'none'}
          style={{ color: i < count ? '#f59e0b' : 'var(--color-border)' }}
        />
      ))}
    </div>
  )
}
