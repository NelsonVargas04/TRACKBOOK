import { useEffect, useState } from 'react'
import { useLang } from '@/context/LanguageContext'
import { getApplications } from '@/services/applications.service'

export default function ConversionFunnel() {
  const { t } = useLang()
  const [animated, setAnimated] = useState(false)
  const [counts, setCounts] = useState({ applied: 0, inProcess: 0, screening: 0, interview: 0, offer: 0, ghosted: 0 })

  useEffect(() => {
    getApplications().then((rows) => {
      setCounts({
        applied:   rows.length,
        inProcess: rows.filter((r) => r.status === 'En Proceso').length,
        screening: rows.filter((r) => ['Screening', 'Entrevista', 'Oferta'].includes(r.status)).length,
        interview: rows.filter((r) => ['Entrevista', 'Oferta'].includes(r.status)).length,
        offer:     rows.filter((r) => r.status === 'Oferta').length,
        ghosted:   rows.filter((r) => r.status === 'Ghosteado').length,
      })
    }).catch(console.error)
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const stages = [
    { labelKey: 'status.applied',   value: counts.applied,   color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
    { labelKey: 'status.inProcess', value: counts.inProcess, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
    { labelKey: 'status.screening', value: counts.screening, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    { labelKey: 'status.interview', value: counts.interview, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    { labelKey: 'status.offer',     value: counts.offer,     color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
    { labelKey: 'status.ghosted',   value: counts.ghosted,   color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  ]

  const max = stages[0].value || 1

  return (
    <div
      className="rounded-xl p-6 flex flex-col h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
            {t('funnel.title')}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {t('funnel.subtitle')}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>
          {t('funnel.last30')}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {stages.map(({ labelKey, value, color, bg }, i) => {
          const pct = Math.round((value / max) * 100)
          const conv = i > 0 ? (stages[i - 1].value > 0 ? Math.round((value / stages[i - 1].value) * 100) : 0) : null
          const label = t(labelKey)

          return (
            <div key={labelKey} className="flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0" style={{ width: 100 }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <div
                  className="rounded-full overflow-hidden"
                  style={{ flex: 1, height: 28, background: 'var(--color-bg)' }}
                >
                  <div
                    className="h-full rounded-full flex items-center px-3"
                    style={{
                      width: animated ? `${pct}%` : '0%',
                      background: `linear-gradient(90deg, ${color}99, ${color})`,
                      minWidth: animated && value > 0 ? 40 : 0,
                      transition: `width 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.12}s`,
                    }}
                  >
                    {value > 0 && <span className="text-sm font-bold text-white">{value}</span>}
                  </div>
                </div>

                <div className="shrink-0 text-right" style={{ width: 100 }}>
                  {conv !== null ? (
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color }}>
                      {conv}% {t('funnel.conv')}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>100%</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-6 gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        {stages.map(({ labelKey, value, color }) => (
          <div key={labelKey} className="flex flex-col gap-0.5">
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t(labelKey)}</span>
            <span
              className="text-3xl font-black leading-none"
              style={{ fontFamily: 'Manrope, sans-serif', color }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
