import { useEffect, useState, useRef } from 'react'
import {
  X, DollarSign, Calendar, User, Link2,
  Clock, ChevronDown, Check, ExternalLink,
  Briefcase, Trash2, Send, MessageSquare, Sparkles,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CompanyIcon } from '@/components/ui/CompanyIcon'
import type { Application, Status, ActivityEntry } from '@/data/mockApplications'

const statusOptions: Status[] = ['Aplicada', 'Screening', 'Entrevista', 'Oferta', 'Rechazada']

const typeOptions = ['Remoto', 'Híbrido', 'Presencial']

const EVENT_PRESETS = [
  'Postulación enviada',
  'Primer contacto del recruiter',
  'Screening telefónico',
  'Entrevista técnica',
  'Entrevista con RRHH',
  'Entrevista con el equipo',
  'Prueba técnica enviada',
  'Prueba técnica entregada',
  'Oferta recibida',
  'Negociación de salario',
  'Oferta aceptada',
  'Rechazada',
  'Sin respuesta',
]

function eventColor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('rechaz') || l.includes('sin respuesta')) return '#ef4444'
  if (l.includes('oferta') || l.includes('aceptada')) return '#22c55e'
  if (l.includes('entrevista')) return '#f59e0b'
  if (l.includes('prueba') || l.includes('técnica')) return '#a78bfa'
  if (l.includes('screening') || l.includes('contacto')) return '#38bdf8'
  return 'var(--color-accent)'
}

const EVENT_KEYWORDS = [
  'entrevista', 'screening', 'oferta', 'rechaz', 'aceptada', 'recruiter',
  'contacto', 'prueba', 'técnica', 'tecnica', 'postulación', 'postulacion',
  'llamaron', 'negociación', 'negociacion', 'sin respuesta',
]

function isEventLike(text: string) {
  const l = text.trim().toLowerCase()
  if (l.length < 3) return false
  return EVENT_KEYWORDS.some((k) => l.includes(k))
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  app: Application
  onClose: () => void
  onUpdate: (updated: Application) => void
}

export function ApplicationDrawer({ app, onClose, onUpdate }: Props) {
  const [visible, setVisible] = useState(false)
  const [data, setData] = useState<Application>(app)
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info')

  // status dropdown
  const [statusOpen, setStatusOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)

  // composer
  const [draft, setDraft] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const composerRef = useRef<HTMLDivElement>(null)

  // editing activity entry
  const [editingId, setEditingId] = useState<number | null>(null)

  const matchedPreset = EVENT_PRESETS.find((p) => p.toLowerCase() === draft.trim().toLowerCase())
  const isEventDraft = !!matchedPreset || isEventLike(draft)
  const suggestions = draft.trim()
    ? EVENT_PRESETS.filter((p) => p.toLowerCase().includes(draft.trim().toLowerCase())).slice(0, 5)
    : []

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false)
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) setShowSuggest(false)
    }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  function handleClose() {
    setVisible(false)
    onUpdate(data)
    setTimeout(onClose, 320)
  }

  function patch(partial: Partial<Application>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function submitDraft(forceKind?: 'event' | 'note') {
    const text = draft.trim()
    if (!text) return
    const kind: 'event' | 'note' = forceKind ?? (isEventDraft ? 'event' : 'note')
    const entry: ActivityEntry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      label: text,
      kind,
    }
    patch({
      activity: [...(data.activity ?? []), entry].sort((a, b) => b.date.localeCompare(a.date)),
    })
    setDraft('')
    setShowSuggest(false)
  }

  function removeActivity(id: number) {
    patch({ activity: (data.activity ?? []).filter((e) => e.id !== id) })
  }

  function updateActivity(id: number, partial: Partial<ActivityEntry>) {
    patch({
      activity: (data.activity ?? []).map((e) => e.id === id ? { ...e, ...partial } : e),
    })
  }

  const activity = [...(data.activity ?? [])].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(4px)' : 'blur(0)',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
        }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: 600,
          background: 'var(--color-bg)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: '-24px 0 64px rgba(0,0,0,0.5)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Hero header ── */}
        <div
          className="px-7 pt-6 pb-5 shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <CompanyIcon icon={data.icon} size="lg" />
              <div className="flex-1 min-w-0">
                {/* Editable role */}
                <input
                  value={data.role}
                  onChange={(e) => patch({ role: e.target.value })}
                  className="w-full bg-transparent outline-none font-black text-xl leading-tight"
                  style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}
                />
                {/* Editable company */}
                <input
                  value={data.company}
                  onChange={(e) => patch({ company: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 shrink-0"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Status + type row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status dropdown */}
            <div ref={statusRef} className="relative">
              <button
                onClick={() => setStatusOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: 'var(--color-bg)',
                  border: `1.5px solid ${statusOpen ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                <StatusBadge status={data.status} />
                <ChevronDown size={13} style={{ color: 'var(--color-text-muted)', transform: statusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {statusOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 rounded-xl overflow-hidden z-20 flex flex-col"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', minWidth: 160 }}
                >
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { patch({ status: s }); setStatusOpen(false) }}
                      className="flex items-center justify-between px-3 py-2.5 hover:brightness-110 transition-all"
                      style={{ background: data.status === s ? 'var(--color-accent-light)' : 'transparent' }}
                    >
                      <StatusBadge status={s} />
                      {data.status === s && <Check size={13} style={{ color: 'var(--color-accent-text)' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type pills */}
            {typeOptions.map((t) => (
              <button
                key={t}
                onClick={() => patch({ type: t })}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: data.type === t ? 'var(--color-accent)' : 'var(--color-bg)',
                  border: `1px solid ${data.type === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: data.type === t ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {t}
              </button>
            ))}

            {/* Stars */}
            <div className="flex items-center gap-0.5 ml-auto">
              {[1,2,3,4,5].map((i) => (
                <button key={i} onClick={() => patch({ stars: i })} className="transition-transform hover:scale-110">
                  <svg width="16" height="16" viewBox="0 0 24 24"
                    fill={i <= data.stars ? '#f59e0b' : 'none'}
                    stroke={i <= data.stars ? '#f59e0b' : 'var(--color-border)'}
                    strokeWidth="2"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex px-7 gap-1 shrink-0"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          {(['info', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 text-sm font-semibold transition-all relative"
              style={{ color: activeTab === tab ? 'var(--color-accent-text)' : 'var(--color-text-muted)' }}
            >
              {tab === 'info' ? 'Información' : `Actividad (${activity.length})`}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-0">

              {/* Key fields grid */}
              <div className="grid grid-cols-2 gap-5 px-7 py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <EditableField icon={Calendar} label="Fecha de aplicación" value={data.date} onChange={(v) => patch({ date: v })} />
                <EditableField icon={DollarSign} label="Salario" value={data.salary ?? ''} onChange={(v) => patch({ salary: v })} placeholder="ej. $80k – $120k" />
                <EditableField icon={User} label="Contacto / Recruiter" value={data.contact ?? ''} onChange={(v) => patch({ contact: v })} placeholder="Nombre y cargo" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-widest font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Link2 size={11} /> Link de oferta
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      value={data.url ?? ''}
                      onChange={(e) => patch({ url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 rounded-xl px-3 py-2.5 outline-none"
                      style={{ fontSize: '13px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    />
                    {data.url && (
                      <a href={data.url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
                        style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}
                      >
                        <ExternalLink size={14} style={{ color: 'var(--color-accent-text)' }} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="px-7 py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <label className="text-[11px] uppercase tracking-widest font-semibold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                  Notas
                </label>
                <textarea
                  value={data.note ?? ''}
                  onChange={(e) => patch({ note: e.target.value })}
                  rows={5}
                  placeholder="Agrega contexto, requisitos importantes, próximos pasos..."
                  className="w-full rounded-xl px-4 py-3 outline-none resize-none"
                  style={{
                    fontSize: '14px', lineHeight: '1.65',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>

              {/* Tag */}
              <div className="px-7 py-6">
                <EditableField icon={Briefcase} label="Etiqueta" value={data.tag ?? ''} onChange={(v) => patch({ tag: v })} placeholder="ej. Top Pick, Urgente…" />
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="px-7 py-6 flex flex-col gap-5">

              {/* Composer */}
              <div ref={composerRef} className="relative">
                <div
                  className="rounded-2xl flex flex-col"
                  style={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${draft ? (isEventDraft ? eventColor(draft) + '66' : 'var(--color-border)') : 'var(--color-border)'}`,
                    transition: 'border-color 0.18s ease',
                  }}
                >
                  <textarea
                    value={draft}
                    onChange={(e) => { setDraft(e.target.value); setShowSuggest(true) }}
                    onFocus={() => setShowSuggest(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        submitDraft()
                      }
                    }}
                    rows={2}
                    placeholder="Escribe una nota o registra un evento (Entrevista técnica, Me llamaron…)"
                    className="w-full rounded-2xl px-4 pt-3 pb-2 outline-none resize-none bg-transparent"
                    style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-primary)', minHeight: 64 }}
                  />

                  <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ fontSize: '11px' }}>
                      {draft.trim() ? (
                        isEventDraft ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: eventColor(draft) }} />
                            <span style={{ color: eventColor(draft), fontWeight: 600 }}>Evento</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare size={11} style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Nota</span>
                          </>
                        )
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                          ⌘ + Enter para enviar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {draft.trim() && !isEventDraft && (
                        <button
                          onClick={() => submitDraft('event')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                          title="Guardar como evento del proceso"
                        >
                          <Sparkles size={11} />
                          Como evento
                        </button>
                      )}
                      <button
                        onClick={() => submitDraft()}
                        disabled={!draft.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        <Send size={11} />
                        Añadir
                      </button>
                    </div>
                  </div>
                </div>

                {showSuggest && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-10"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
                  >
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                      Sugerencias
                    </div>
                    {suggestions.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setDraft(p); setShowSuggest(false) }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:brightness-110 transition-all flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: eventColor(p) }} />
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline */}
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2.5">
                  <Clock size={32} strokeWidth={1.25} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                  <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Sin actividad registrada</p>
                </div>
              ) : (
                <div className="relative flex flex-col">
                  <div className="absolute left-[7px] top-2 bottom-2" style={{ width: 1.5, background: 'var(--color-border)' }} />

                  {activity.map((entry) => {
                    const isNote = entry.kind === 'note'
                    const color = isNote ? 'var(--color-text-muted)' : eventColor(entry.label)
                    const isEditing = editingId === entry.id
                    return (
                      <div key={entry.id} className="group flex gap-4 pb-4 last:pb-0">
                        <div className="relative shrink-0 pt-3.5">
                          {isNote ? (
                            <div
                              className="w-[15px] h-[15px] rounded-full flex items-center justify-center"
                              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: '0 0 0 3px var(--color-bg)' }}
                            >
                              <MessageSquare size={8} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                          ) : (
                            <div
                              className="w-[15px] h-[15px] rounded-full"
                              style={{ background: color, boxShadow: '0 0 0 3px var(--color-bg)' }}
                            />
                          )}
                        </div>

                        <div
                          className="flex-1 rounded-xl px-3.5 py-2.5 cursor-text"
                          style={{
                            background: isNote ? 'var(--color-surface)' : 'var(--color-surface)',
                            border: `1px solid ${isNote ? 'var(--color-border)' : color + '33'}`,
                          }}
                          onClick={() => !isEditing && setEditingId(entry.id)}
                        >
                          {isEditing ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                              <textarea
                                autoFocus
                                value={entry.label}
                                onChange={(e) => updateActivity(entry.id, { label: e.target.value })}
                                rows={2}
                                className="w-full rounded-lg px-2.5 py-2 outline-none resize-none text-sm"
                                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-accent)', color: 'var(--color-text-primary)', lineHeight: '1.5' }}
                              />
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="date"
                                  value={entry.date}
                                  onChange={(e) => updateActivity(entry.id, { date: e.target.value })}
                                  className="rounded-lg px-2 py-1 outline-none text-xs"
                                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', colorScheme: 'dark' }}
                                />
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateActivity(entry.id, { kind: isNote ? 'event' : 'note' })}
                                    className="px-2 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                                    title={isNote ? 'Marcar como evento' : 'Marcar como nota'}
                                  >
                                    {isNote ? 'Evento' : 'Nota'}
                                  </button>
                                  <button
                                    onClick={() => removeActivity(entry.id)}
                                    className="p-1.5 rounded-lg transition-all hover:opacity-80"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white"
                                    style={{ background: 'var(--color-accent)' }}
                                  >
                                    Listo
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-sm flex-1 min-w-0 leading-snug"
                                style={{
                                  color: isNote ? 'var(--color-text-secondary, var(--color-text-primary))' : 'var(--color-text-primary)',
                                  fontWeight: isNote ? 400 : 600,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {entry.label}
                              </p>
                              <span className="text-[11px] shrink-0 mt-0.5 tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                                {fmtDate(entry.date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center gap-3 px-7 py-4 shrink-0"
          style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl font-medium transition-opacity hover:opacity-70"
            style={{ fontSize: '14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ fontSize: '14px', background: 'var(--color-accent)' }}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </>
  )
}

function EditableField({
  icon: Icon, label, value, onChange, placeholder,
}: {
  icon: React.ElementType
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
        <Icon size={11} />
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '—'}
        className="rounded-xl px-3 py-2.5 outline-none"
        style={{ fontSize: '13px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      />
    </div>
  )
}
