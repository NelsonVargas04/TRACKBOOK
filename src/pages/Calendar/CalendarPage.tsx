import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, EventClickArg, EventContentArg } from '@fullcalendar/core'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import Sidebar from '@/pages/Dashboard/components/Sidebar'
import Header from '@/pages/Dashboard/components/Header'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LanguageContext'
import './calendar.css'

const EVENT_TYPES: Record<string, { color: string; bg: string }> = {
  'Entrevista':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)' },
  'Seguimiento': { color: '#06b6d4', bg: 'rgba(6,182,212,0.18)'  },
  'Aplicada':    { color: '#818cf8', bg: 'rgba(129,140,248,0.18)' },
  'Oferta':      { color: '#22c55e', bg: 'rgba(34,197,94,0.18)'   },
  'Deadline':    { color: '#f472b6', bg: 'rgba(244,114,182,0.18)' },
}

function labelToType(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('entrevista') || l.includes('interview')) return 'Entrevista'
  if (l.includes('seguimiento') || l.includes('follow') || l.includes('screening')) return 'Seguimiento'
  if (l.includes('oferta') || l.includes('offer') || l.includes('hired')) return 'Oferta'
  if (l.includes('deadline') || l.includes('limite') || l.includes('vence')) return 'Deadline'
  return 'Seguimiento'
}

type CalEvent = {
  id: string; title: string; date: string; time?: string
  type: string; company: string; role: string; note?: string
}

function toFullCalEvent(e: CalEvent): EventInput {
  const cfg = EVENT_TYPES[e.type] ?? EVENT_TYPES['Seguimiento']
  return {
    id: e.id,
    title: e.time ? `${e.time} ${e.company}` : e.company,
    date: e.date,
    backgroundColor: cfg.bg,
    borderColor: cfg.color,
    textColor: cfg.color,
    extendedProps: e,
  }
}

function EventContent({ event }: EventContentArg) {
  const ep = event.extendedProps as CalEvent
  const cfg = EVENT_TYPES[ep.type] ?? EVENT_TYPES['Seguimiento']
  return (
    <div className="flex items-center gap-1 px-1 py-0.5 w-full truncate">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
      <span className="truncate text-[11px] font-semibold" style={{ color: cfg.color }}>
        {event.title}
      </span>
    </div>
  )
}

type NewEventForm = { title: string; company: string; date: string; time: string; type: string; note: string }

export default function CalendarPage() {
  const { t } = useLang()
  const calRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [view, setView] = useState<'dayGridMonth' | 'listMonth'>('dayGridMonth')
  const [selected, setSelected] = useState<CalEvent | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [form, setForm] = useState<NewEventForm>({ title: '', company: '', date: new Date().toISOString().slice(0,10), time: '', type: 'Entrevista', note: '' })
  const [saving, setSaving] = useState(false)

  async function loadEvents() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: apps }, { data: acts }] = await Promise.all([
      supabase.from('applications').select('id, company, role, status, created_at, url').eq('user_id', user.id),
      supabase.from('activity_entries').select('id, label, note, date, application_id, applications(company, role)').eq('user_id', user.id),
    ])

    const appEvts: CalEvent[] = (apps ?? []).map((a: any) => ({
      id: `app-${a.id}`,
      title: a.role,
      date: a.created_at.slice(0, 10),
      type: a.status === 'Oferta' ? 'Oferta' : 'Aplicada',
      company: a.company,
      role: a.role,
    }))

    const actEvts: CalEvent[] = (acts ?? []).map((e: any) => ({
      id: `act-${e.id}`,
      title: e.label,
      date: e.date,
      type: labelToType(e.label),
      company: e.applications?.company ?? '',
      role: e.applications?.role ?? '',
      note: e.note ?? undefined,
    }))

    setEvents([...appEvts, ...actEvts])
    setLoading(false)
  }

  useEffect(() => { loadEvents().catch(console.error) }, [])

  useEffect(() => {
    const api = calRef.current?.getApi()
    if (api) setTitle(api.view.title)
  }, [loading])

  function navigate(dir: 'prev' | 'next' | 'today') {
    const api = calRef.current?.getApi()
    if (!api) return
    api[dir]()
    setTitle(api.view.title)
  }

  function switchView(v: 'dayGridMonth' | 'listMonth') {
    setView(v)
    setTimeout(() => {
      const api = calRef.current?.getApi()
      if (api) setTitle(api.view.title)
    }, 50)
  }

  function handleEventClick(arg: EventClickArg) {
    setSelected(arg.event.extendedProps as CalEvent)
  }

  async function saveNewEvent() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const noteStr = [form.title, form.note].filter(Boolean).join(' — ')
      await (supabase.from('activity_entries') as any).insert({
        user_id: user.id,
        label: form.type,
        note: noteStr || null,
        date: form.date,
      })
      await loadEvents()
      setShowNewModal(false)
      setForm({ title: '', company: '', date: new Date().toISOString().slice(0,10), time: '', type: 'Entrevista', note: '' })
    } finally {
      setSaving(false)
    }
  }

  // Upcoming events from today sorted
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
    .slice(0, 7)

  const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden flex flex-col px-8 py-5 gap-4">

          {/* Section title */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                {t('calendar.title')}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('calendar.subtitle')}
              </p>
            </div>
          </div>

          {/* Custom toolbar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('prev')} className="p-2 rounded-lg transition-colors" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => navigate('next')} className="p-2 rounded-lg transition-colors" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-xl font-black capitalize" style={{ fontFamily: 'Manrope', color: 'var(--color-text-primary)', minWidth: 160 }}>{title}</h2>
            <button onClick={() => navigate('today')} className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              {t('calendar.today')}
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* View toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                {(['dayGridMonth', 'listMonth'] as const).map((v) => (
                  <button key={v} onClick={() => switchView(v)} className="px-4 py-1.5 text-sm font-semibold transition-colors"
                    style={{ background: view === v ? 'var(--color-accent)' : 'var(--color-surface)', color: view === v ? '#fff' : 'var(--color-text-muted)' }}>
                    {v === 'dayGridMonth' ? t('calendar.monthView') : t('calendar.listView')}
                  </button>
                ))}
              </div>
              {/* New event */}
              <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--color-accent)', color: '#fff' }}>
                <Plus size={15} />
                {t('calendar.newEvent')}
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
            {/* Calendar */}
            <div className="flex-1 overflow-auto rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full animate-pulse">
                  <div className="w-12 h-12 rounded-full" style={{ background: 'var(--color-bg)' }} />
                </div>
              ) : (
                <FullCalendar
                  ref={calRef}
                  plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                  initialView={view}
                  key={view}
                  events={events.map(toFullCalEvent)}
                  eventClick={handleEventClick}
                  eventContent={(arg) => <EventContent {...arg} />}
                  headerToolbar={false}
                  height="100%"
                  locale="es"
                  firstDay={1}
                  dayMaxEvents={3}
                  noEventsText={t('calendar.noEvents')}
                  datesSet={(arg) => setTitle(arg.view.title)}
                />
              )}
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4 overflow-y-auto" style={{ width: 300, flexShrink: 0 }}>
              {/* Upcoming events */}
              <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="font-bold text-base mb-0.5" style={{ fontFamily: 'Manrope', color: 'var(--color-text-primary)' }}>
                  {t('calendar.upcoming')}
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {t('calendar.upcomingFrom')} {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>

                {upcoming.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>{t('calendar.noEvents')}</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {upcoming.map((e) => {
                      const d = new Date(e.date + 'T12:00:00')
                      const cfg = EVENT_TYPES[e.type] ?? EVENT_TYPES['Seguimiento']
                      const isToday = e.date === today
                      return (
                        <div key={e.id} className="flex gap-3 items-start cursor-pointer group" onClick={() => setSelected(e)}>
                          <div className="text-center shrink-0" style={{ width: 36 }}>
                            <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>
                              {MONTHS[d.getMonth()]}
                            </p>
                            <p className="text-lg font-black leading-tight" style={{ fontFamily: 'Manrope', color: isToday ? 'var(--color-accent-text)' : 'var(--color-text-primary)' }}>
                              {d.getDate()}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0 border-l-2 pl-3" style={{ borderColor: cfg.color }}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-sm font-bold" style={{ color: cfg.color }}>{e.type}</span>
                              {isToday && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>hoy</span>}
                            </div>
                            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                              {e.company}{e.role ? ` · ${e.role}` : ''}
                            </p>
                          </div>
                          {e.time && (
                            <span className="text-xs font-mono shrink-0" style={{ color: 'var(--color-text-muted)' }}>{e.time}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="font-bold text-base mb-0.5" style={{ fontFamily: 'Manrope', color: 'var(--color-text-primary)' }}>
                  {t('calendar.types')}
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>{t('calendar.typesDesc')}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {Object.entries(EVENT_TYPES).map(([type, cfg]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event detail */}
              {selected && (
                <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-surface)', border: `1px solid ${(EVENT_TYPES[selected.type] ?? EVENT_TYPES['Seguimiento']).color}44` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: (EVENT_TYPES[selected.type] ?? EVENT_TYPES['Seguimiento']).bg, color: (EVENT_TYPES[selected.type] ?? EVENT_TYPES['Seguimiento']).color }}>
                        {selected.type}
                      </span>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ color: 'var(--color-text-muted)' }}><X size={14} /></button>
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'Manrope' }}>{selected.company}</p>
                    {selected.role && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selected.role}</p>}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{selected.date}</p>
                  {selected.note && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{selected.note}</p>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* New event modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowNewModal(false)}>
          <div className="rounded-2xl p-6 w-[420px] flex flex-col gap-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg" style={{ fontFamily: 'Manrope', color: 'var(--color-text-primary)' }}>{t('calendar.newEvent')}</h3>
              <button onClick={() => setShowNewModal(false)} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
            </div>

            {/* Type */}
            <div className="flex gap-2 flex-wrap">
              {Object.keys(EVENT_TYPES).map((type) => {
                const cfg = EVENT_TYPES[type]
                const sel = form.type === type
                return (
                  <button key={type} onClick={() => setForm(f => ({ ...f, type }))}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                    style={{ background: sel ? cfg.color : cfg.bg, color: sel ? '#fff' : cfg.color, border: `1px solid ${cfg.color}` }}>
                    {type}
                  </button>
                )
              })}
            </div>

            {[
              { label: t('calendar.formTitle'), key: 'title', type: 'text', placeholder: 'Ej: Entrevista final' },
              { label: t('calendar.formCompany'), key: 'company', type: 'text', placeholder: 'Empresa' },
              { label: t('calendar.formDate'), key: 'date', type: 'date', placeholder: '' },
              { label: t('calendar.formTime'), key: 'time', type: 'time', placeholder: '' },
            ].map(({ label, key, type: inputType, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
                <input
                  type={inputType}
                  value={(form as any)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            ))}

            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowNewModal(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                {t('import.cancel')}
              </button>
              <button onClick={saveNewEvent} disabled={saving || !form.date} className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'var(--color-accent)', color: '#fff' }}>
                {saving ? '...' : t('calendar.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
