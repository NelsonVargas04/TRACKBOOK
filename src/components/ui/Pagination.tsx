import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label?: string
}

export function Pagination({ page, totalPages, onPageChange, label }: PaginationProps) {
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
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
            style={{
              background: page === i + 1 ? 'var(--color-accent)' : 'var(--color-bg)',
              border: `1px solid ${page === i + 1 ? 'var(--color-accent)' : 'var(--color-border)'}`,
              color: page === i + 1 ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {i + 1}
          </button>
        ))}
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
