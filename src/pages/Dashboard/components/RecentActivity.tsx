import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LanguageContext'

type ActivityItem = {
  id: number
  label: string
  note: string | null
  date: string
  company: string
  role: string
}

function relativeTime(dateStr: string, t: (k: string) => string): string {
  const diff = Date.now() - new Date(dateStr + 'T12:00:00').getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return t('activity.today')
  if (days === 1) return t('activity.yesterday')
  return `${t('activity.daysAgo1')} ${days} ${t('activity.daysAgo2')}`
}

function eventColor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('rechaz') || l.includes('sin respuesta') || l.includes('rejected') || l.includes('no response')) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  if (l.includes('oferta') || l.includes('aceptada') || l.includes('offer') || l.includes('accepted')) return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
  if (l.includes('entrevista') || l.includes('interview')) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
  if (l.includes('prueba') || l.includes('técnica') || l.includes('test') || l.includes('technical')) return { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' }
  if (l.includes('screening') || l.includes('contacto') || l.includes('contact')) return { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' }
  return { color: 'var(--color-accent-text)', bg: 'var(--color-accent-light)' }
}

export default function RecentActivity() {
  const { t } = useLang()
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Try activity entries first
        const { data: entries } = await supabase
          .from('activity_entries')
          .select('id, label, note, date, applications(company, role)')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(6)

        if (entries && entries.length > 0) {
          setItems(entries.map((e: any) => ({
            id: e.id,
            label: e.label,
            note: e.note,
            date: e.date,
            company: e.applications?.company ?? '',
            role: e.applications?.role ?? '',
          })))
          return
        }

        // Fallback: show recently created applications
        const { data: apps } = await supabase
          .from('applications')
          .select('id, company, role, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6)

        if (apps) {
          setItems(apps.map((a: any) => ({
            id: a.id,
            label: a.status,
            note: null,
            date: a.created_at.slice(0, 10),
            company: a.company,
            role: a.role,
          })))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div
      className="rounded-xl p-6 flex flex-col h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
            {t('activity.title')}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t('activity.subtitle')}</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl shrink-0" style={{ background: 'var(--color-bg)' }} />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--color-bg)' }} />
                <div className="h-2.5 rounded-full w-1/2" style={{ background: 'var(--color-bg)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2.5 py-10">
          <Clock
            size={32}
            strokeWidth={1.25}
            style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
          />
          <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {t('activity.empty')}
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col">
          {items.map(({ id, label, note, date, company, role }, i) => {
            const { color, bg } = eventColor(label)
            const isLast = i === items.length - 1
            return (
              <div key={id} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                    style={{ background: bg, color, border: `1px solid ${color}20`, flexShrink: 0 }}
                  >
                    {label.charAt(0).toUpperCase()}
                  </div>
                  {!isLast && (
                    <div className="flex-1 mt-1 mb-1" style={{ width: 1, background: 'var(--color-border)', minHeight: 16 }} />
                  )}
                </div>

                <div className="flex-1 min-w-0" style={{ paddingBottom: isLast ? 0 : 14 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-snug" style={{ color }}>
                        {label}
                      </p>
                      <p className="text-xs mt-0.5 truncate font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {company}{role ? ` · ${role}` : ''}
                      </p>
                      {note && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{note}</p>
                      )}
                    </div>
                    <span className="text-xs shrink-0 mt-0.5 font-medium tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                      {relativeTime(date, t)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
