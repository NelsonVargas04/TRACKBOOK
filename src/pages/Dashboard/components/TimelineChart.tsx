import { useEffect, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { getApplications } from '@/services/applications.service'
import { useLang } from '@/context/LanguageContext'

type MonthData = { month: string; count: number }

export default function TimelineChart() {
  const { t } = useLang()
  const [data, setData] = useState<MonthData[]>([])
  const [peak, setPeak] = useState(0)

  useEffect(() => {
    getApplications().then((rows) => {
      const map: Record<string, number> = {}
      rows.forEach((r) => {
        const d = new Date(r.created_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        map[key] = (map[key] ?? 0) + 1
      })

      const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      // Start from 2nd month, keep last 12
      const trimmed = sorted.length > 1 ? sorted.slice(1) : sorted
      const last12 = trimmed.slice(-12)
      const maxVal = last12.reduce((m, [, c]) => Math.max(m, c), 0)
      setPeak(maxVal)

      setData(last12.map(([key, count]) => {
        const [yr, mo] = key.split('-')
        const label = new Date(Number(yr), Number(mo) - 1)
          .toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        return { month: label, count }
      }))
    }).catch(console.error)
  }, [])

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
            {t('timeline.title')}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {t('timeline.subtitle')}
          </p>
        </div>
        {peak > 0 && (
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{t('timeline.peak')}</p>
            <p className="text-2xl font-black" style={{ fontFamily: 'Manrope', color: 'var(--color-accent-text)', lineHeight: 1 }}>
              {peak}
            </p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-36" style={{ color: 'var(--color-text-muted)' }}>
          <p className="text-sm">{t('timeline.empty')}</p>
        </div>
      ) : (
        <div style={{ height: 160 }}>
          <ResponsiveBar
            data={data}
            keys={['count']}
            indexBy="month"
            margin={{ top: 8, right: 8, bottom: 28, left: 0 }}
            padding={0.35}
            borderRadius={5}
            colors={() => 'var(--color-accent)'}
            colorBy="indexValue"
            theme={{
              axis: {
                ticks: {
                  text: { fill: 'var(--color-text-muted)', fontSize: 11 },
                  line: { stroke: 'transparent' },
                },
                domain: { line: { stroke: 'transparent' } },
              },
              grid: { line: { stroke: 'transparent' } },
              tooltip: {
                container: {
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  color: 'var(--color-text-primary)',
                  fontSize: 12,
                },
              },
            }}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
            }}
            axisLeft={null}
            enableGridY={false}
            enableLabel={false}
            tooltip={({ id: _id, value, indexValue }) => (
              <div style={{ padding: '8px 12px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{indexValue}</span>
                <br />
                <span style={{ color: 'var(--color-accent-text)', fontWeight: 800, fontSize: 16 }}>
                  {value} <span style={{ fontWeight: 400, fontSize: 11 }}>{t('timeline.apps')}</span>
                </span>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
