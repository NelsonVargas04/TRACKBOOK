import { useMemo, useId } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useApplications } from '@/context/ApplicationsContext'
import { useLang } from '@/context/LanguageContext'

type Point = { x: string; y: number }

export default function TimelineChart() {
  const { t } = useLang()
  const { rows, loading } = useApplications()
  const gradientId = useId().replace(/:/g, '')

  const { points, peak } = useMemo(() => {
    const map: Record<string, number> = {}
    rows.forEach((r) => {
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = (map[key] ?? 0) + 1
    })

    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    const trimmed = sorted.length > 1 ? sorted.slice(1) : sorted
    const last12 = trimmed.slice(-12)

    const peak = last12.reduce((m, [, c]) => Math.max(m, c), 0)
    const points: Point[] = last12.map(([key, count]) => {
      const [yr, mo] = key.split('-')
      const label = new Date(Number(yr), Number(mo) - 1)
        .toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      return { x: label, y: count }
    })
    return { points, peak }
  }, [rows])

  const data = [{ id: 'apps', data: points }]

  if (loading) {
    return (
      <div className="rounded-xl p-6 animate-pulse"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-5 w-40 rounded-full mb-2" style={{ background: 'var(--color-bg)' }} />
            <div className="h-3 w-48 rounded-full" style={{ background: 'var(--color-bg)' }} />
          </div>
          <div className="w-12 h-10 rounded-full" style={{ background: 'var(--color-bg)' }} />
        </div>
        <div className="h-48 rounded-lg" style={{ background: 'var(--color-bg)' }} />
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-2">
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

      {points.length === 0 ? (
        <div className="flex items-center justify-center h-36" style={{ color: 'var(--color-text-muted)' }}>
          <p className="text-sm">{t('timeline.empty')}</p>
        </div>
      ) : (
        <div style={{ height: 200 }}>
          <ResponsiveLine
            data={data}
            margin={{ top: 28, right: 40, bottom: 40, left: 30 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 0, max: peak + Math.ceil(peak * 0.15) || 10, stacked: false }}
            curve="monotoneX"
            enableArea
            areaOpacity={0.18}
            colors={['var(--color-accent)']}
            lineWidth={2.5}
            enablePoints
            pointSize={8}
            pointColor="var(--color-surface)"
            pointBorderWidth={2.5}
            pointBorderColor="var(--color-accent)"
            enablePointLabel={false}
            enableGridX={false}
            enableGridY={false}
            axisTop={null}
            axisRight={null}
            axisLeft={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              renderTick: ({ x, y, value }) => (
                <g transform={`translate(${x},${y})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  >
                    {value}
                  </text>
                </g>
              ),
            }}
            defs={[
              {
                id: gradientId,
                type: 'linearGradient',
                colors: [
                  { offset: 0, color: 'var(--color-accent)', opacity: 0.6 },
                  { offset: 100, color: 'var(--color-accent)', opacity: 0 },
                ],
                gradientTransform: 'rotate(90)',
              },
            ]}
            fill={[{ match: '*', id: gradientId }]}
            theme={{
              text: { fontSize: 11, fill: 'var(--color-text-muted)' },
              tooltip: {
                container: {
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--color-text-primary)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                },
              },
            }}
            tooltip={({ point }) => (
              <div style={{ padding: '6px 12px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{String(point.data.x)}</span>
                <br />
                <span style={{ color: 'var(--color-accent-text)', fontWeight: 800, fontSize: 15 }}>
                  {String(point.data.y)} <span style={{ fontWeight: 400, fontSize: 11 }}>{t('timeline.apps')}</span>
                </span>
              </div>
            )}
            animate
            motionConfig="gentle"
            layers={[
              'grid', 'axes', 'areas', 'crosshair', 'lines', 'points', 'slices', 'mesh',
              ({ points: pts, innerHeight }) => (
                <g>
                  {pts.map((pt) => {
                    const isLow = pt.y > innerHeight * 0.75
                    return (
                      <text
                        key={pt.id}
                        x={pt.x}
                        y={isLow ? pt.y - 18 : pt.y - 14}
                        textAnchor="middle"
                        style={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-text-primary)' }}
                      >
                        {String(pt.data.y)}
                      </text>
                    )
                  })}
                </g>
              ),
            ]}
          />
        </div>
      )}
    </div>
  )
}
