import { StatusBadge } from '@/components/ui/StatusBadge'
import { Stars } from '@/components/ui/Stars'
import { Pagination } from '@/components/ui/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { useLang } from '@/context/LanguageContext'
import type { Application } from '@/data/mockApplications'
import { SourceBadge } from '@/components/ui/SourceIcons'

const PER_PAGE = 7
const COLS = '48px 2.2fr 1.2fr 1fr 1fr 1.1fr 1.1fr'

export function ListView({ apps, onSelect }: { apps: Application[]; onSelect?: (app: Application) => void }) {
  const { t } = useLang()
  const { page, totalPages, setPage, slice, rangeStart, rangeEnd } = usePagination(apps.length, PER_PAGE)
  const visible = slice(apps)

  const headers = ['#', t('list.company'), t('list.source'), t('list.created'), t('list.updated'), t('list.status'), t('list.relevance')]

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

      {/* Header */}
      <div
        className="grid items-center px-6 py-4"
        style={{
          gridTemplateColumns: COLS,
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {headers.map((h, i) => (
          <span
            key={i}
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {visible.map((app, i) => (
        <div
          key={app.id}
          className="grid items-center px-6 cursor-pointer transition-colors"
          style={{
            gridTemplateColumns: COLS,
            minHeight: 72,
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
          onClick={() => onSelect?.(app)}
        >
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {rangeStart + i}
          </span>

          <div className="flex items-center gap-3 min-w-0 py-3">
            <div
              className="rounded-xl flex items-center justify-center font-bold shrink-0 text-sm"
              style={{
                width: 40, height: 40,
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent-text)',
                border: '1px solid var(--color-accent-border)',
                letterSpacing: '0.03em',
              }}
            >
              {app.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold truncate leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                {app.role}
              </p>
              <p className="text-sm truncate leading-snug mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {app.company}
              </p>
            </div>
          </div>

          <div>
            {app.source
              ? <SourceBadge source={app.source} />
              : <span className="text-sm" style={{ color: 'var(--color-text-muted)', opacity: 0.35 }}>—</span>
            }
          </div>

          <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {app.date}
          </span>

          <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            {app.updatedAt ?? <span style={{ opacity: 0.3 }}>—</span>}
          </span>

          <div className="flex">
            <StatusBadge status={app.status} />
          </div>

          <Stars count={app.stars} />
        </div>
      ))}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        label={`${t('list.showing')} ${rangeStart}–${rangeEnd} ${t('list.of')} ${apps.length} ${t('list.applications')}`}
      />
    </div>
  )
}
