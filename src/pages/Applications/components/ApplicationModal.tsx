import { useState, useRef } from 'react'
import {
  X, DollarSign, Calendar, User, Link2,
  Clock, ChevronDown, Check, ExternalLink,
  Trash2, Loader2, Send, MessageSquare, Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SourceCombobox } from '@/components/ui/SourceIcons'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useLang } from '@/context/LanguageContext'
import { statusConfig } from '@/data/mockApplications'
import { addActivityEntry, updateActivityEntry, deleteActivityEntry } from '@/services/activity.service'
import type { Application, Status, ActivityEntry } from '@/data/mockApplications'

const statusOptions: Status[] = ['Aplicada', 'Screening', 'Entrevista', 'Oferta', 'Rechazada']
const typeValuesES = ['Remoto', 'Híbrido', 'Presencial']

const EVENT_PRESET_KEYS = [
  'event.sent', 'event.firstContact', 'event.phoneScreen', 'event.techInterview',
  'event.hrInterview', 'event.teamInterview', 'event.testSent', 'event.testDelivered',
  'event.offerReceived', 'event.salaryNeg', 'event.offerAccepted', 'event.rejected', 'event.noResponse',
]

function eventColor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('rechaz') || l.includes('sin respuesta') || l.includes('rejected') || l.includes('no response')) return '#ef4444'
  if (l.includes('oferta') || l.includes('aceptada') || l.includes('offer') || l.includes('accepted')) return '#22c55e'
  if (l.includes('entrevista') || l.includes('interview')) return '#f59e0b'
  if (l.includes('prueba') || l.includes('técnica') || l.includes('test') || l.includes('technical')) return '#a78bfa'
  if (l.includes('screening') || l.includes('contacto') || l.includes('contact')) return '#38bdf8'
  return 'var(--color-accent)'
}

const EVENT_KEYWORDS = [
  'entrevista', 'screening', 'oferta', 'rechaz', 'aceptada', 'recruiter',
  'contacto', 'prueba', 'técnica', 'tecnica', 'postulación', 'postulacion',
  'llamaron', 'negociación', 'negociacion', 'sin respuesta',
  'interview', 'offer', 'rejected', 'accepted', 'contact', 'test', 'technical',
  'sent', 'no response',
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


export function ApplicationModal({ app, onClose, onUpdate }: Props) {
  const { t } = useLang()
  const [data, setData] = useState<Application>(app)
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info')
  const closeRef = useRef<(() => void) | null>(null)

  const [statusOpen, setStatusOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  useClickOutside(statusRef, () => setStatusOpen(false))

  // Composer
  const [draft, setDraft] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const composerRef = useRef<HTMLDivElement>(null)
  useClickOutside(composerRef, () => setShowSuggest(false))
  const [addingEvent, setAddingEvent] = useState(false)
  const [forcedKind, setForcedKind] = useState<'event' | 'note' | null>(null)
  const [composerError, setComposerError] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editDate, setEditDate] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete state — id being deleted (shows spinner)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const PRESET_LABELS = EVENT_PRESET_KEYS.map((k) => t(k))
  const matchedPreset = PRESET_LABELS.find((p) => p.toLowerCase() === draft.trim().toLowerCase())
  const draftKind: 'event' | 'note' = forcedKind ?? (matchedPreset || isEventLike(draft) ? 'event' : 'note')
  const suggestions = draft.trim()
    ? PRESET_LABELS.filter((p) => p.toLowerCase().includes(draft.trim().toLowerCase())).slice(0, 5)
    : []

  const typeOptions = typeValuesES

  function patch(partial: Partial<Application>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function handleSave() {
    const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    onUpdate({ ...data, updatedAt: now })
    closeRef.current?.()
  }

  function openEdit(entry: ActivityEntry) {
    setEditingId(entry.id)
    setEditLabel(entry.label)
    setEditDate(entry.date)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditLabel(''); setEditDate('')
  }

  async function submitDraft() {
    const text = draft.trim()
    if (!text || addingEvent) return
    setAddingEvent(true)
    setComposerError(null)
    try {
      const row = await addActivityEntry({
        application_id: data.id,
        label: text,
        note: null,
        date: new Date().toISOString().slice(0, 10),
      } as any)
      const entry: ActivityEntry = {
        id: row.id,
        date: (row as any).date ?? new Date().toISOString().slice(0, 10),
        label: row.label,
        note: row.note ?? undefined,
      }
      patch({ activity: [...(data.activity ?? []), entry] })
      setDraft('')
      setForcedKind(null)
      setShowSuggest(false)
    } catch (e: any) {
      console.error('addActivityEntry failed', e)
      const msg: string = e?.message ?? 'No se pudo guardar el evento'
      if (msg.includes("'date' column")) {
        try {
          const row = await addActivityEntry({
            application_id: data.id,
            label: text,
            note: null,
          } as any)
          const entry: ActivityEntry = {
            id: row.id,
            date: (row as any).date ?? new Date().toISOString().slice(0, 10),
            label: row.label,
            note: row.note ?? undefined,
          }
          patch({ activity: [...(data.activity ?? []), entry] })
          setDraft('')
          setForcedKind(null)
          setShowSuggest(false)
          setComposerError(null)
          return
        } catch (e2: any) {
          setComposerError(e2?.message ?? msg)
          return
        }
      }
      setComposerError(msg)
    } finally {
      setAddingEvent(false)
    }
  }

  async function saveEdit() {
    if (!editLabel.trim() || editingId === null || savingEdit) return
    setSavingEdit(true)
    try {
      const row = await updateActivityEntry(editingId, {
        label: editLabel.trim(),
        date: editDate,
      })
      patch({
        activity: (data.activity ?? []).map((e) =>
          e.id === editingId
            ? { id: row.id, date: row.date, label: row.label, note: row.note ?? undefined }
            : e
        ),
      })
      cancelEdit()
    } catch (e) {
      console.error(e)
    } finally {
      setSavingEdit(false)
    }
  }

  async function removeActivity(id: number) {
    if (deletingId !== null) return
    setDeletingId(id)
    try {
      await deleteActivityEntry(id)
      patch({ activity: (data.activity ?? []).filter((e) => e.id !== id) })
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  const activity = [...(data.activity ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const cfg = statusConfig[data.status]

  return (
    <Modal onClose={onClose}>
      {(animatedClose) => {
        closeRef.current = animatedClose
        return (<div
        className="rounded-2xl w-[860px] flex flex-col overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', height: '88vh', maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="px-8 py-6 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="rounded-xl flex items-center justify-center font-bold text-base shrink-0"
                  style={{ width: 44, height: 44, background: 'var(--color-accent-light)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent-border)', letterSpacing: '0.03em' }}
                >
                  {data.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <input value={data.role} onChange={(e) => patch({ role: e.target.value })} className="w-full bg-transparent outline-none font-black text-2xl leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }} />
                  <input value={data.company} onChange={(e) => patch({ company: e.target.value })} className="w-full bg-transparent outline-none text-base mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div ref={statusRef} className="relative">
                  <button
                    onClick={() => setStatusOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: cfg.bg, border: `1.5px solid ${statusOpen ? cfg.color : cfg.color + '70'}` }}
                  >
                    <StatusBadge status={data.status} />
                    <ChevronDown size={13} style={{ color: cfg.color, transform: statusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  {statusOpen && (
                    <div className="absolute left-0 top-full mt-1.5 rounded-xl overflow-hidden z-20 flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', minWidth: 170 }}>
                      {statusOptions.map((s) => (
                        <button key={s} onClick={() => { patch({ status: s }); setStatusOpen(false) }} className="flex items-center justify-between px-3 py-2.5 hover:brightness-110 transition-all" style={{ background: data.status === s ? 'var(--color-accent-light)' : 'transparent', borderBottom: '1px solid var(--color-border)' }}>
                          <StatusBadge status={s} />
                          {data.status === s && <Check size={13} style={{ color: 'var(--color-accent-text)' }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {typeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => patch({ type: opt })}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: data.type === opt ? 'var(--color-accent)' : 'var(--color-bg)', border: `1px solid ${data.type === opt ? 'var(--color-accent)' : 'var(--color-border)'}`, color: data.type === opt ? '#fff' : 'var(--color-text-muted)' }}
                  >
                    {opt}
                  </button>
                ))}

                <div className="flex items-center gap-0.5 ml-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => patch({ stars: i })} className="transition-transform hover:scale-110">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={i <= data.stars ? '#f59e0b' : 'none'} stroke={i <= data.stars ? '#f59e0b' : 'var(--color-border)'} strokeWidth="2">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={animatedClose} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 shrink-0" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-8 shrink-0" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          {(['info', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3.5 text-sm font-semibold transition-all relative"
              style={{ color: activeTab === tab ? 'var(--color-accent-text)' : 'var(--color-text-muted)' }}
            >
              {tab === 'info' ? t('modal.info') : `${t('modal.activity')} (${activity.length})`}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {activeTab === 'info' && (
            <div className="flex flex-col gap-6 px-8 py-7">
              <div className="grid grid-cols-2 gap-5">
                <InlineField icon={Calendar} label={t('modal.dateApplied')} value={data.date} onChange={(v) => patch({ date: v })} />
                <SalaryField label={t('modal.salary')} value={data.salary ?? ''} onChange={(v) => patch({ salary: v })} placeholder={t('modal.salaryPlaceholder')} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <InlineField icon={User} label={t('modal.contact')} value={data.contact ?? ''} onChange={(v) => patch({ contact: v })} placeholder={t('modal.contactPlaceholder')} />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Link2 size={11} /> {t('modal.offerLink')}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg flex-1" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <Link2 size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
                      <input value={data.url ?? ''} onChange={(e) => patch({ url: e.target.value })} placeholder="https://..." className="flex-1 bg-transparent outline-none" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }} />
                    </div>
                    {data.url && (
                      <a href={data.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 hover:opacity-70" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
                        <ExternalLink size={15} style={{ color: 'var(--color-accent-text)' }} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  {t('modal.offerSource')}
                </label>
                <SourceCombobox
                  value={data.source ?? null}
                  onChange={(s) => patch({ source: s ?? undefined })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>{t('modal.notes')}</label>
                <textarea
                  value={data.note ?? ''}
                  onChange={(e) => patch({ note: e.target.value })}
                  rows={5}
                  placeholder={t('modal.notesPlaceholder')}
                  className="rounded-xl px-4 py-3.5 outline-none resize-none"
                  style={{ fontSize: '15px', lineHeight: '1.65', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="px-8 py-6 flex flex-col gap-5">

              {/* Composer */}
              <div ref={composerRef} className="relative">
                <div
                  className="rounded-xl flex items-center gap-2 px-3 py-2"
                  style={{
                    background: 'var(--color-bg)',
                    border: `1px solid ${draft ? (draftKind === 'event' ? eventColor(draft) + '66' : 'var(--color-border)') : 'var(--color-border)'}`,
                    transition: 'border-color 0.18s ease',
                  }}
                >
                  <div className="shrink-0 flex items-center" style={{ minWidth: 16 }}>
                    {draft.trim() ? (
                      draftKind === 'event' ? (
                        <div className="w-2 h-2 rounded-full" style={{ background: eventColor(draft) }} />
                      ) : (
                        <MessageSquare size={13} style={{ color: 'var(--color-text-muted)' }} />
                      )
                    ) : (
                      <Send size={13} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                    )}
                  </div>

                  <input
                    value={draft}
                    onChange={(e) => { setDraft(e.target.value); setForcedKind(null); setShowSuggest(true); setComposerError(null) }}
                    onFocus={() => setShowSuggest(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); submitDraft() }
                    }}
                    placeholder="Añade un evento o nota — Entrevista técnica, Me llamaron…"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}
                  />

                  {draft.trim() && draftKind === 'note' && (
                    <button
                      onClick={() => setForcedKind('event')}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all hover:opacity-80 shrink-0"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                      title="Marcar como evento"
                    >
                      <Sparkles size={10} />
                      Evento
                    </button>
                  )}

                  <button
                    onClick={submitDraft}
                    disabled={!draft.trim() || addingEvent}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    style={{ background: 'var(--color-accent)' }}
                    title="Añadir (Enter)"
                  >
                    {addingEvent ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>

                {composerError && (
                  <p className="text-xs mt-1.5 px-1" style={{ color: '#ef4444' }}>
                    {composerError}
                  </p>
                )}

                {showSuggest && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-10"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
                  >
                    {suggestions.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setDraft(p); setShowSuggest(false) }}
                        className="w-full text-left px-3 py-2 text-sm hover:brightness-110 transition-all flex items-center gap-2"
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
                  <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('modal.noActivity')}</p>
                </div>
              ) : (
                <div className="relative flex flex-col">
                  <div className="absolute left-[7px] top-2 bottom-2" style={{ width: 1.5, background: 'var(--color-border)' }} />

                  {activity.map((entry) => {
                    const isNote = !isEventLike(entry.label) && !PRESET_LABELS.some((p) => p.toLowerCase() === entry.label.toLowerCase())
                    const color = isNote ? 'var(--color-text-muted)' : eventColor(entry.label)
                    const isEditing = editingId === entry.id
                    const isDeleting = deletingId === entry.id
                    return (
                      <div key={entry.id} className="group flex gap-4 pb-4 last:pb-0">
                        <div className="relative shrink-0 pt-3.5">
                          {isDeleting ? (
                            <div
                              className="w-[15px] h-[15px] rounded-full flex items-center justify-center"
                              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: '0 0 0 3px var(--color-surface)' }}
                            >
                              <Loader2 size={9} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                          ) : isNote ? (
                            <div
                              className="w-[15px] h-[15px] rounded-full flex items-center justify-center"
                              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: '0 0 0 3px var(--color-surface)' }}
                            >
                              <MessageSquare size={8} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                          ) : (
                            <div
                              className="w-[15px] h-[15px] rounded-full"
                              style={{ background: color, boxShadow: '0 0 0 3px var(--color-surface)' }}
                            />
                          )}
                        </div>

                        <div
                          className="flex-1 rounded-xl px-3.5 py-2.5 cursor-text transition-all"
                          style={{
                            background: 'var(--color-bg)',
                            border: `1px solid ${isNote ? 'var(--color-border)' : color + '33'}`,
                            opacity: isDeleting ? 0.4 : 1,
                          }}
                          onClick={() => !isEditing && !isDeleting && openEdit(entry)}
                        >
                          {isEditing ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                              <textarea
                                autoFocus
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                rows={2}
                                className="w-full rounded-lg px-2.5 py-2 outline-none resize-none text-sm"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', color: 'var(--color-text-primary)', lineHeight: '1.5' }}
                              />
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="rounded-lg px-2 py-1 outline-none text-xs"
                                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', colorScheme: 'dark' }}
                                />
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => removeActivity(entry.id)}
                                    className="p-1.5 rounded-lg transition-all hover:opacity-80"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                                    title={t('modal.cancel')}
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-70"
                                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                                  >
                                    {t('modal.cancel')}
                                  </button>
                                  <button
                                    onClick={saveEdit}
                                    disabled={!editLabel.trim() || savingEdit}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1 transition-opacity"
                                    style={{ background: 'var(--color-accent)', opacity: !editLabel.trim() || savingEdit ? 0.5 : 1 }}
                                  >
                                    {savingEdit && <Loader2 size={10} className="animate-spin" />}
                                    {t('modal.done')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-sm flex-1 min-w-0 leading-snug"
                                style={{
                                  color: 'var(--color-text-primary)',
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

        {/* Footer */}
        <div className="flex items-center gap-3 justify-end px-8 py-5 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={animatedClose} className="px-6 py-3 rounded-xl font-medium hover:opacity-70 transition-opacity" style={{ fontSize: '15px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            {t('modal.cancel')}
          </button>
          <button onClick={handleSave} className="px-7 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity" style={{ fontSize: '15px', background: 'var(--color-accent)' }}>
            {t('modal.saveChanges')}
          </button>
        </div>
      </div>
      )}}
    </Modal>
  )
}

function InlineField({ icon: Icon, label, value, onChange, placeholder }: {
  icon: React.ElementType; label: string; value: string
  onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
        <Icon size={11} />{label}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        <Icon size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? '—'} className="flex-1 bg-transparent outline-none" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }} onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = 'var(--color-accent)')} onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = 'var(--color-border)')} />
      </div>
    </div>
  )
}

function SalaryField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [display, setDisplay] = useState(() => {
    const n = parseFloat(String(value).replace(/[^0-9.]/g, ''))
    return isNaN(n) ? value : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  })

  function handleFocus() {
    const raw = String(display).replace(/[^0-9.]/g, '')
    setDisplay(raw)
  }

  function handleBlur() {
    const raw = String(display).replace(/[^0-9.]/g, '')
    const n = parseFloat(raw)
    if (!raw || isNaN(n)) {
      setDisplay('')
      onChange('')
    } else {
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
      setDisplay(formatted)
      onChange(formatted)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
        <DollarSign size={11} />{label}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        <DollarSign size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
        <input
          value={display}
          onChange={(e) => setDisplay(e.target.value)}
          onFocus={(e) => { handleFocus(); e.currentTarget.parentElement!.style.borderColor = 'var(--color-accent)' }}
          onBlur={(e) => { handleBlur(); e.currentTarget.parentElement!.style.borderColor = 'var(--color-border)' }}
          placeholder={placeholder ?? '—'}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}
          inputMode="decimal"
        />
      </div>
    </div>
  )
}
