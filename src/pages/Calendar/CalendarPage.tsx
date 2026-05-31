import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, EventClickArg } from '@fullcalendar/core'
import Sidebar from '@/pages/Dashboard/components/Sidebar'
import Header from '@/pages/Dashboard/components/Header'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LanguageContext'
import './calendar.css'

const STATUS_COLORS: Record<string, string> = {
  'Aplicada':   '#818cf8',
  'Screening':  '#a78bfa',
  'Entrevista': '#f59e0b',
  'Oferta':     '#22c55e',
  'Rechazada':  '#ef4444',
  'Ghosteado':  '#64748b',
  'En Proceso': '#06b6d4',
}

export default function CalendarPage() {
  const { t } = useLang()
  const [events, setEvents] = useState<EventInput[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<null | {
    title: string; company: string; status: string; date: string; type: string; url?: string
  }>(null)
  const [view, setView] = useState<'dayGridMonth' | 'listMonth'>('dayGridMonth')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: apps }, { data: acts }] = await Promise.all([
        supabase.from('applications').select('id, company, role, status, created_at, url').eq('user_id', user.id),
        supabase.from('activity_entries').select('id, label, note, date, application_id, applications(company, role)').eq('user_id', user.id),
      ])

      const appEvents: EventInput[] = (apps ?? []).map((a: any) => ({
        id: `app-${a.id}`,
        title: `${a.company} — ${a.role}`,
        date: a.created_at.slice(0, 10),
        backgroundColor: STATUS_COLORS[a.status] ?? '#818cf8',
        borderColor: 'transparent',
        extendedProps: { type: 'application', company: a.company, status: a.status, url: a.url },
      }))

      const actEvents: EventInput[] = (acts ?? []).map((e: any) => ({
        id: `act-${e.id}`,
        title: `${e.label} — ${e.applications?.company ?? ''}`,
        date: e.date,
        backgroundColor: '#f59e0b',
        borderColor: 'transparent',
        extendedProps: { type: 'activity', company: e.applications?.company ?? '', status: e.label, note: e.note },
      }))

      setEvents([...appEvents, ...actEvents])
      setLoading(false)
    }
    load().catch(console.error)
  }, [])

  function handleEventClick(arg: EventClickArg) {
    const p = arg.event.extendedProps
    setSelected({
      title: arg.event.title,
      company: p.company,
      status: p.status,
      date: arg.event.startStr,
      type: p.type,
      url: p.url,
    })
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                {t('calendar.title')}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('calendar.subtitle')}
              </p>
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              {(['dayGridMonth', 'listMonth'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-4 py-2 text-sm font-semibold transition-colors"
                  style={{
                    background: view === v ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: view === v ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {v === 'dayGridMonth' ? t('calendar.monthView') : t('calendar.listView')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: selected ? '1fr 320px' : '1fr' }}>
            {/* Calendar */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {loading ? (
                <div className="flex items-center justify-center h-96 animate-pulse">
                  <div className="w-12 h-12 rounded-full" style={{ background: 'var(--color-bg)' }} />
                </div>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                  initialView={view}
                  key={view}
                  events={events}
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: '',
                  }}
                  height="auto"
                  locale="es"
                  buttonText={{ today: t('calendar.today') }}
                  noEventsText={t('calendar.noEvents')}
                  eventDisplay="block"
                  dayMaxEvents={3}
                />
              )}
            </div>

            {/* Event detail panel */}
            {selected && (
              <div
                className="rounded-xl p-5 flex flex-col gap-4 h-fit"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-start justify-between">
                  <h2 className="font-bold text-base leading-snug" style={{ color: 'var(--color-text-primary)', fontFamily: 'Manrope' }}>
                    {selected.company}
                  </h2>
                  <button onClick={() => setSelected(null)} style={{ color: 'var(--color-text-muted)' }}>✕</button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('calendar.status')}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: `${STATUS_COLORS[selected.status]}22`,
                        color: STATUS_COLORS[selected.status] ?? 'var(--color-accent-text)',
                      }}
                    >
                      {selected.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('calendar.date')}</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{selected.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('calendar.type')}</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {selected.type === 'application' ? t('calendar.typeApp') : t('calendar.typeActivity')}
                    </span>
                  </div>
                </div>

                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center py-2 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  >
                    {t('calendar.viewOffer')}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Status legend */}
          <div className="flex flex-wrap gap-3 mt-5">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{status}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
