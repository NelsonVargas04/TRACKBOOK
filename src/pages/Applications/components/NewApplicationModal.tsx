import { useState, useRef, useEffect } from 'react'
import { X, Building2, Briefcase, DollarSign, FileText, ChevronDown, Check, Star, Link2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useCV } from '@/context/CVContext'
import { useCoverLetter } from '@/context/CoverLetterContext'
import { useLang } from '@/context/LanguageContext'
import { SourceCombobox } from '@/components/ui/SourceIcons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { statusConfig } from '@/data/mockApplications'
import type { Application, Status, Source } from '@/data/mockApplications'

interface Props {
  onClose: () => void
  onAdd: (app: Application) => void
  loading?: boolean
}

const statusOptions: Status[] = ['Aplicada', 'En Proceso', 'Screening', 'Entrevista', 'Oferta', 'Ghosteado', 'Rechazada']


export function NewApplicationModal({ onClose, onAdd, loading = false }: Props) {
  const { t } = useLang()
  const { cvs, primaryId } = useCV()
  const { coverLetters, primaryCLId } = useCoverLetter()

  const typeOptions = [t('new.remote'), t('new.hybrid'), t('new.onsite')]

  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [type, setType] = useState(t('new.remote'))
  const [status, setStatus] = useState<Status>('Aplicada')
  const [salaryRaw, setSalaryRaw] = useState('')
  const [salaryDisplay, setSalaryDisplay] = useState('')
  const [note, setNote] = useState('')
  const [stars, setStars] = useState(3)
  const [cvId, setCvId] = useState<number | null>(primaryId)
  const [coverLetterId, setCoverLetterId] = useState<number | null>(primaryCLId)

  // Sync when context loads async
  useEffect(() => { if (primaryId !== null && cvId === null) setCvId(primaryId) }, [primaryId])
  useEffect(() => { if (primaryCLId !== null && coverLetterId === null) setCoverLetterId(primaryCLId) }, [primaryCLId])
  const [source, setSource] = useState<Source | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [url, setUrl] = useState('')

  function handleSubmit() {
    setSubmitted(true)
    if (!role.trim() || !company.trim() || !source) return
    const now = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    onAdd({
      id: Date.now(),
      role: role.trim(),
      company: company.trim(),
      date: now,
      status,
      stars,
      type,
      icon: '🏢',
      ...(salaryRaw && { salary: salaryDisplay }),
      ...(note.trim() && { note: note.trim() }),
      ...(cvId !== null && { cvId }),
      ...(coverLetterId !== null && { coverLetterId }),
      ...(source && { source }),
      ...(url.trim() && { url: url.trim() }),
    })
    onClose()
  }

  const sourceError = submitted && !source

  return (
    <Modal onClose={onClose}>
      <div
        className="rounded-2xl w-[640px] flex flex-col overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
              {t('new.title')}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('new.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-7 py-6 overflow-y-auto">

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('new.role')} icon={Briefcase}>
              <input
                autoFocus
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={t('new.rolePlaceholder')}
                className="w-full bg-transparent outline-none"
                style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
              />
            </Field>
            <Field label={t('new.company')} icon={Building2}>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t('new.companyPlaceholder')}
                className="w-full bg-transparent outline-none"
                style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {t('new.modality')}
              </label>
              <div className="flex gap-2">
                {typeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setType(opt)}
                    className="flex-1 py-2.5 rounded-lg font-semibold transition-all"
                    style={{
                      fontSize: '13px',
                      background: type === opt ? 'var(--color-accent)' : 'var(--color-bg)',
                      border: `1px solid ${type === opt ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: type === opt ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <StatusSelect value={status} onChange={setStatus} label={t('new.status')} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: sourceError ? '#ef4444' : 'var(--color-text-muted)' }}>
                {t('new.source')}
              </label>
              {sourceError && (
                <span className="text-xs font-medium" style={{ color: '#ef4444' }}>— {t('new.sourceRequired')}</span>
              )}
            </div>
            <SourceCombobox value={source} onChange={setSource} error={sourceError} />
          </div>

          <Field label={t('new.link')} icon={Link2}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/..."
              className="w-full bg-transparent outline-none"
              style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
            />
          </Field>

          <SalaryField
            label={t('new.salary')}
            raw={salaryRaw}
            display={salaryDisplay}
            onChange={(raw, display) => { setSalaryRaw(raw); setSalaryDisplay(display) }}
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
              {t('new.relevance')}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setStars(i)} className="p-0.5 transition-transform hover:scale-110">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill={i <= stars ? '#f59e0b' : 'none'} stroke={i <= stars ? '#f59e0b' : 'var(--color-border)'} strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {cvs.length > 0 && coverLetters.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <CVSelect cvs={cvs} primaryId={primaryId} value={cvId} onChange={setCvId} label={t('new.cvLabel')} placeholder={t('new.cvPlaceholder')} searchPlaceholder={t('new.searchCV')} noResults={t('new.noResults')} primaryLabel={t('new.principal')} />
              <CoverLetterSelect coverLetters={coverLetters} primaryCLId={primaryCLId} value={coverLetterId} onChange={setCoverLetterId} label={t('new.clLabel')} placeholder={t('new.clPlaceholder')} searchPlaceholder={t('new.searchCL')} noResults={t('new.noResults')} primaryLabel={t('new.principal')} />
            </div>
          ) : cvs.length > 0 ? (
            <CVSelect cvs={cvs} primaryId={primaryId} value={cvId} onChange={setCvId} label={t('new.cvLabel')} placeholder={t('new.cvPlaceholder')} searchPlaceholder={t('new.searchCV')} noResults={t('new.noResults')} primaryLabel={t('new.principal')} />
          ) : coverLetters.length > 0 ? (
            <CoverLetterSelect coverLetters={coverLetters} primaryCLId={primaryCLId} value={coverLetterId} onChange={setCoverLetterId} label={t('new.clLabel')} placeholder={t('new.clPlaceholder')} searchPlaceholder={t('new.searchCL')} noResults={t('new.noResults')} primaryLabel={t('new.principal')} />
          ) : null}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
              {t('new.notes')}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={t('new.notesPlaceholder')}
              className="rounded-lg px-4 py-3 outline-none resize-none"
              style={{
                fontSize: '14px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 justify-end px-7 py-5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-70"
            style={{ fontSize: '14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            {t('new.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-semibold text-white transition-opacity flex items-center gap-2"
            style={{ fontSize: '14px', background: 'var(--color-accent)', opacity: loading ? 0.4 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading && (
              <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {loading ? t('upload.uploading') : t('new.save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CVSelect({ cvs, primaryId, value, onChange, label, placeholder, searchPlaceholder, noResults, primaryLabel }: {
  cvs: { id: number; name: string; date: string }[]
  primaryId: number | null
  value: number | null
  onChange: (id: number | null) => void
  label: string
  placeholder: string
  searchPlaceholder: string
  noResults: string
  primaryLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useClickOutside(ref, () => { setOpen(false); setQuery(''); setDebouncedQuery('') })

  const selected = cvs.find((c) => c.id === value)
  const filtered = debouncedQuery.trim()
    ? cvs.filter((c) => c.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : cvs

  function handleQueryChange(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim()) {
      setSearching(true)
      debounceRef.current = setTimeout(() => { setDebouncedQuery(val); setSearching(false) }, 400)
    } else {
      setDebouncedQuery('')
      setSearching(false)
    }
  }

  function handleOpen() {
    setOpen((v) => !v)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function handleSelect(id: number) {
    onChange(id)
    setOpen(false)
    setQuery('')
    setDebouncedQuery('')
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          onClick={handleOpen}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{ background: 'var(--color-bg)', border: `1.5px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}` }}
        >
          <FileText size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
          <span className="flex-1 font-medium truncate" style={{ color: selected ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontSize: '14px' }}>
            {selected ? selected.name : placeholder}
          </span>
          {selected && primaryId === selected.id && (
            <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b', flexShrink: 0 }} />
          )}
          <ChevronDown size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 bottom-full mb-1.5 rounded-xl z-20 flex flex-col overflow-hidden"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 -8px 32px rgba(0,0,0,0.35)' }}
          >
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {searching
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--color-accent-text)', flexShrink: 0, animation: 'spin 0.7s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" /></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
              <input ref={searchRef} value={query} onChange={(e) => handleQueryChange(e.target.value)} placeholder={searchPlaceholder} className="flex-1 bg-transparent outline-none" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }} />
              {query && <button onClick={() => { setQuery(''); setDebouncedQuery(''); setSearching(false) }} style={{ color: 'var(--color-text-muted)' }}><X size={13} /></button>}
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{noResults} "{query}"</p>
                </div>
              ) : (
                filtered.map((cv) => {
                  const isSelected = value === cv.id
                  return (
                    <button key={cv.id} onClick={() => handleSelect(cv.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:brightness-110" style={{ background: isSelected ? 'var(--color-accent-light)' : 'transparent', borderBottom: '1px solid var(--color-border)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: isSelected ? 'var(--color-accent)' : 'var(--color-accent-light)' }}>
                        <FileText size={12} style={{ color: isSelected ? '#fff' : 'var(--color-accent-text)' }} />
                      </div>
                      <span className="flex-1 font-medium truncate" style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>{cv.name}</span>
                      {primaryId === cv.id && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{primaryLabel}</span>
                      )}
                      {isSelected && <Check size={14} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CoverLetterSelect({ coverLetters, primaryCLId, value, onChange, label, placeholder, searchPlaceholder, noResults, primaryLabel }: {
  coverLetters: { id: number; name: string; date: string; preview: string }[]
  primaryCLId: number | null
  value: number | null
  onChange: (id: number | null) => void
  label: string
  placeholder: string
  searchPlaceholder: string
  noResults: string
  primaryLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useClickOutside(ref, () => { setOpen(false); setQuery(''); setDebouncedQuery('') })

  const selected = coverLetters.find((c) => c.id === value)
  const filtered = debouncedQuery.trim()
    ? coverLetters.filter((c) => c.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : coverLetters

  function handleQueryChange(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim()) {
      setSearching(true)
      debounceRef.current = setTimeout(() => { setDebouncedQuery(val); setSearching(false) }, 400)
    } else {
      setDebouncedQuery('')
      setSearching(false)
    }
  }

  function handleOpen() {
    setOpen((v) => !v)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  function handleSelect(id: number) {
    onChange(id)
    setOpen(false)
    setQuery('')
    setDebouncedQuery('')
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          onClick={handleOpen}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
          style={{ background: 'var(--color-bg)', border: `1.5px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}` }}
        >
          <FileText size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
          <span className="flex-1 font-medium truncate" style={{ color: selected ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontSize: '14px' }}>
            {selected ? selected.name : placeholder}
          </span>
          {selected && primaryCLId === selected.id && (
            <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b', flexShrink: 0 }} />
          )}
          <ChevronDown size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 bottom-full mb-1.5 rounded-xl z-20 flex flex-col overflow-hidden"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 -8px 32px rgba(0,0,0,0.35)' }}
          >
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {searching
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--color-accent-text)', flexShrink: 0, animation: 'spin 0.7s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" /></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              }
              <input ref={searchRef} value={query} onChange={(e) => handleQueryChange(e.target.value)} placeholder={searchPlaceholder} className="flex-1 bg-transparent outline-none" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }} />
              {query && <button onClick={() => { setQuery(''); setDebouncedQuery(''); setSearching(false) }} style={{ color: 'var(--color-text-muted)' }}><X size={13} /></button>}
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{noResults} "{query}"</p>
                </div>
              ) : (
                filtered.map((cl) => {
                  const isSelected = value === cl.id
                  return (
                    <button key={cl.id} onClick={() => handleSelect(cl.id)} className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:brightness-110" style={{ background: isSelected ? 'var(--color-accent-light)' : 'transparent', borderBottom: '1px solid var(--color-border)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: isSelected ? 'var(--color-accent)' : 'var(--color-accent-light)' }}>
                        <FileText size={12} style={{ color: isSelected ? '#fff' : 'var(--color-accent-text)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>{cl.name}</p>
                        <p className="truncate mt-0.5" style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{cl.preview}</p>
                      </div>
                      {primaryCLId === cl.id && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{primaryLabel}</span>
                      )}
                      {isSelected && <Check size={14} style={{ color: 'var(--color-accent-text)', flexShrink: 0, marginTop: 2 }} />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusSelect({ value, onChange, label }: { value: Status; onChange: (s: Status) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))
  const cfg = statusConfig[value]

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: cfg.bg, border: `1.5px solid ${open ? cfg.color : cfg.color + '80'}` }}
        >
          <StatusBadge status={value} />
          <ChevronDown size={14} style={{ color: cfg.color, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-20 flex flex-col"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
          >
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false) }}
                className="flex items-center justify-between px-3 py-2.5 transition-all hover:brightness-110"
                style={{ background: value === s ? statusConfig[s].bg : 'transparent', borderBottom: '1px solid var(--color-border)' }}
              >
                <StatusBadge status={s} />
                {value === s && <Check size={13} style={{ color: statusConfig[s].color }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SalaryField({ label, raw, display, onChange }: {
  label: string
  raw: string
  display: string
  onChange: (raw: string, display: string) => void
}) {
  const [focused, setFocused] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    if (!digits) { onChange('', ''); return }
    const num = parseInt(digits, 10)
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
    onChange(digits, formatted)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-3 py-3 rounded-lg transition-colors"
        style={{
          background: 'var(--color-bg)',
          border: `1px solid ${focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
        }}
      >
        <DollarSign size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
        <input
          type="text"
          inputMode="numeric"
          value={focused ? raw : display}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0.00"
          className="w-full bg-transparent outline-none tabular-nums"
          style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
        />
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-3 py-3 rounded-lg"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
      >
        <Icon size={15} style={{ color: 'var(--color-accent-text)', flexShrink: 0 }} />
        {children}
      </div>
    </div>
  )
}
