import { useEffect, useState } from 'react'
import { ResponsivePie } from '@nivo/pie'
import { getApplications } from '@/services/applications.service'
import { useLang } from '@/context/LanguageContext'
import { SourceLogo } from '@/components/ui/SourceIcons'

type SourceRow = { id: string; label: string; value: number; pct: number; color: string }

const PALETTE = [
  '#818cf8', '#a78bfa', '#06b6d4', '#f59e0b',
  '#22c55e', '#f472b6', '#38bdf8', '#fb923c',
]

export default function SourcesChart() {
  const { t } = useLang()
  const [rows, setRows] = useState<SourceRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApplications().then((apps) => {
      const map: Record<string, number> = {}
      apps.forEach((a) => {
        const s = a.source ?? 'Otro'
        map[s] = (map[s] ?? 0) + 1
      })
      const t = apps.length || 1
      setTotal(apps.length)
      const sorted = Object.entries(map)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([source, count], i) => ({
          id: source,
          label: source,
          value: count,
          pct: Math.round((count / t) * 100),
          color: PALETTE[i % PALETTE.length],
        }))
      setRows(sorted)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div
        className="rounded-xl p-6 flex flex-col h-full animate-pulse"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="mb-4">
          <div className="h-5 w-32 rounded-full mb-2" style={{ background: 'var(--color-bg)' }} />
          <div className="h-3 w-40 rounded-full" style={{ background: 'var(--color-bg)' }} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full" style={{ background: 'var(--color-bg)' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-6 flex flex-col h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="mb-4">
        <p className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
          {t('sources.title')}
        </p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {t('sources.subtitle')}
        </p>
      </div>

      {/* Donut chart */}
      <div style={{ height: 200, position: 'relative' }}>
        {rows.length > 0 && (
          <ResponsivePie
            data={rows}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            innerRadius={0.65}
            padAngle={1.5}
            cornerRadius={4}
            colors={({ data }) => data.color}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            tooltip={({ datum }) => (
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  color: 'var(--color-text-primary)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ color: datum.color, fontWeight: 700 }}>{datum.label}</span>
                {' — '}{datum.value} ({datum.data.pct}%)
              </div>
            )}
            motionConfig="gentle"
          />
        )}
        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <p className="font-black" style={{ fontFamily: 'Manrope', fontSize: 28, color: 'var(--color-text-primary)', lineHeight: 1 }}>
            {total}
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {t('timeline.apps')}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-4">
        {rows.map(({ id, value, pct, color }) => (
          <div key={id} className="flex items-center gap-2">
            <SourceLogo source={id} size={14} />
            <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {id}
            </span>
            <span className="text-xs font-black tabular-nums" style={{ color, minWidth: 28, textAlign: 'right' }}>
              {value}
            </span>
            <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)', minWidth: 30, textAlign: 'right' }}>
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
