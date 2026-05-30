import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label?: string
}

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end   = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages, onPageChange, label }: PaginationProps) {
  const range = getPageRange(page, totalPages)

  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
    >
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label ?? `Página ${page} de ${totalPages}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: page === 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
          }}
        >
          <ChevronLeft size={13} />
        </button>

        {range.map((item, i) =>
          item === '...'
            ? (
              <span
                key={`ellipsis-${i}`}
                className="w-7 h-7 flex items-center justify-center text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                …
              </span>
            )
            : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
                style={{
                  background: page === item ? 'var(--color-accent)' : 'var(--color-bg)',
                  border: `1px solid ${page === item ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: page === item ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {item}
              </button>
            )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: page === totalPages ? 'var(--color-border)' : 'var(--color-text-muted)',
          }}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
