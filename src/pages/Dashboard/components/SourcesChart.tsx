import { useEffect, useState } from 'react'
import { getApplications } from '@/services/applications.service'
import { useLang } from '@/context/LanguageContext'
import { SourceLogo } from '@/components/ui/SourceIcons'

type SourceRow = { source: string; count: number; pct: number }

export default function SourcesChart() {
  const { t } = useLang()
  const [rows, setRows] = useState<SourceRow[]>([])

  useEffect(() => {
    getApplications().then((apps) => {
      const map: Record<string, number> = {}
      apps.forEach((a) => {
        const s = a.source ?? 'Otro'
        map[s] = (map[s] ?? 0) + 1
      })
      const total = apps.length || 1
      const sorted = Object.entries(map)
        .map(([source, count]) => ({ source, count, pct: Math.round((count / total) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
      setRows(sorted)
    }).catch(console.error)
  }, [])

  const max = rows[0]?.count || 1

  return (
    <div
      className="rounded-xl p-6 h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="mb-5">
        <p className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
          {t('sources.title')}
        </p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {t('sources.subtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map(({ source, count, pct }) => (
          <div key={source} className="flex items-center gap-3">
            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
              <SourceLogo source={source} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {source}
                </span>
                <span className="text-xs font-bold ml-2 shrink-0" style={{ color: 'var(--color-accent-text)' }}>
                  {count}
                </span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'var(--color-bg)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(count / max) * 100}%`, background: 'var(--color-accent)' }}
                />
              </div>
            </div>
            <span className="text-xs w-8 text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
