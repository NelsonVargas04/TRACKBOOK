import { useEffect, useState } from 'react'
import { Ghost } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { getApplications } from '@/services/applications.service'

export default function GhostingAnalytics() {
  const { t } = useLang()
  const [animated, setAnimated] = useState(false)
  const [bars, setBars] = useState([
    { labelKey: 'ghosting.fast', subKey: 'ghosting.fastSub', pct: 0, color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)'   },
    { labelKey: 'ghosting.late', subKey: 'ghosting.lateSub', pct: 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
    { labelKey: 'ghosting.none', subKey: 'ghosting.noneSub', pct: 0, color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
  ])

  useEffect(() => {
    getApplications().then((rows) => {
      const total = rows.length
      if (total === 0) return

      let fast = 0, late = 0, none = 0
      rows.forEach((r) => {
        const created = new Date(r.created_at).getTime()
        const updated = r.updated_at ? new Date(r.updated_at).getTime() : null
        const diffWeeks = updated ? (updated - created) / (7 * 86400000) : null

        if (diffWeeks === null) {
          none++
        } else if (diffWeeks < 1) {
          fast++
        } else if (diffWeeks <= 3) {
          late++
        } else {
          none++
        }
      })

      setBars((prev) => [
        { ...prev[0], pct: Math.round((fast / total) * 100) },
        { ...prev[1], pct: Math.round((late / total) * 100) },
        { ...prev[2], pct: Math.round((none / total) * 100) },
      ])
    }).catch(console.error)

    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="rounded-xl p-6 flex flex-col justify-between h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
            {t('ghosting.title')}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {t('ghosting.subtitle')}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <Ghost size={15} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      <div className="flex flex-col gap-4 my-5">
        {bars.map(({ labelKey, subKey, pct, color, bg, border }) => (
          <div key={labelKey} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t(labelKey)}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: bg, color, border: `1px solid ${border}` }}>{t(subKey)}</span>
              </div>
              <span className="text-[15px] font-bold tabular-nums" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full w-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: animated ? `${pct}%` : '0%',
                  background: `linear-gradient(90deg, ${color}99, ${color})`,
                  transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        {bars.map(({ labelKey, pct, color, bg, border }) => (
          <div key={labelKey} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
            <span className="text-lg font-black leading-none" style={{ fontFamily: 'Manrope, sans-serif', color }}>{pct}%</span>
            <span className="text-[10px] font-semibold text-center" style={{ color }}>{t(labelKey)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
