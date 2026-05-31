import { useState } from 'react'
import { X, Star, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { CoverLetter } from '@/context/CoverLetterContext'
import { useLang } from '@/context/LanguageContext'

const MAX_NAME    = 80
const MAX_CONTENT = 1500

interface Props {
  onClose: () => void
  onSave: (name: string, content: string, markAsPrimary: boolean) => void
  primaryCLId: number | null
  editing?: CoverLetter
  loading?: boolean
}

export function CoverLetterModal({ onClose, onSave, primaryCLId, editing, loading = false }: Props) {
  const { t } = useLang()
  const [name, setName]               = useState(editing?.name ?? '')
  const [content, setContent]         = useState(editing?.content ?? '')
  const [markAsPrimary, setMarkAsPrimary] = useState(editing ? primaryCLId === editing.id : false)
  const [submitted, setSubmitted]     = useState(false)

  const nameOver    = name.length > MAX_NAME
  const contentOver = content.length > MAX_CONTENT
  const nameEmpty   = name.trim().length === 0
  const contentEmpty = content.trim().length === 0

  const nameError    = submitted && nameEmpty    ? t('cl.errorNameRequired')
                     : nameOver                  ? t('cl.errorNameMax')
                     : null
  const contentError = submitted && contentEmpty ? t('cl.errorContentRequired')
                     : contentOver               ? t('cl.errorContentMax')
                     : null

  const isValid = !nameEmpty && !contentEmpty && !nameOver && !contentOver

  const contentPct    = content.length / MAX_CONTENT
  const counterColor  = contentOver   ? '#ef4444'
                      : contentPct > 0.85 ? '#f59e0b'
                      : 'var(--color-text-muted)'

  function handleSave() {
    setSubmitted(true)
    if (!isValid || loading) return
    onSave(name.trim(), content.trim(), markAsPrimary)
  }

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
              {editing ? t('cl.editTitle') : t('cl.newTitle')}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {editing ? t('cl.editSubtitle') : t('cl.newSubtitle')}
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

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {t('cl.nameLabel')}
              </label>
              <span className="text-xs tabular-nums" style={{ color: name.length > MAX_NAME * 0.85 ? (nameOver ? '#ef4444' : '#f59e0b') : 'var(--color-text-muted)' }}>
                {name.length}/{MAX_NAME}
              </span>
            </div>
            <div
              className="flex items-center gap-2.5 px-3 py-3 rounded-lg transition-colors"
              style={{
                background: 'var(--color-bg)',
                border: `1px solid ${nameError ? '#ef4444' : 'var(--color-border)'}`,
              }}
            >
              <FileText size={15} style={{ color: nameError ? '#ef4444' : 'var(--color-accent-text)', flexShrink: 0 }} />
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('cl.namePlaceholder')}
                className="w-full bg-transparent outline-none"
                style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
              />
            </div>
            {nameError && (
              <div className="flex items-center gap-1.5">
                <AlertCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p className="text-xs" style={{ color: '#ef4444' }}>{nameError}</p>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {t('cl.contentLabel')}
              </label>
              <span className="text-xs font-semibold tabular-nums" style={{ color: counterColor }}>
                {content.length}/{MAX_CONTENT}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(contentPct * 100, 100)}%`,
                  background: contentOver ? '#ef4444' : contentPct > 0.85 ? '#f59e0b' : 'var(--color-accent)',
                  transition: 'width 0.2s ease, background 0.2s ease',
                }}
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="Estimado equipo,&#10;&#10;Me dirijo a ustedes con gran entusiasmo para postularme al puesto de…"
              className="rounded-lg px-4 py-3 outline-none resize-none"
              style={{
                fontSize: '14px',
                lineHeight: '1.7',
                background: 'var(--color-bg)',
                border: `1px solid ${contentError ? '#ef4444' : 'var(--color-border)'}`,
                color: 'var(--color-text-primary)',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => { if (!contentError) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = contentError ? '#ef4444' : 'var(--color-border)' }}
            />
            {contentError && (
              <div className="flex items-center gap-1.5">
                <AlertCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p className="text-xs" style={{ color: '#ef4444' }}>{contentError}</p>
              </div>
            )}
          </div>

          {/* Marcar como principal */}
          <button
            onClick={() => setMarkAsPrimary((v) => !v)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all"
            style={{
              background: markAsPrimary ? 'rgba(245,158,11,0.08)' : 'var(--color-bg)',
              border: `1.5px solid ${markAsPrimary ? 'rgba(245,158,11,0.4)' : 'var(--color-border)'}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{ background: markAsPrimary ? 'rgba(245,158,11,0.2)' : 'var(--color-accent-light)' }}
            >
              <Star size={15} fill={markAsPrimary ? '#f59e0b' : 'none'} style={{ color: markAsPrimary ? '#f59e0b' : 'var(--color-accent-text)' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: markAsPrimary ? '#f59e0b' : 'var(--color-text-primary)' }}>
                {t('cl.markPrimary')}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('cl.markPrimarySub')}
              </p>
            </div>
            <div
              className="w-10 h-6 rounded-full transition-colors flex items-center shrink-0"
              style={{ background: markAsPrimary ? '#f59e0b' : 'var(--color-border)', padding: '2px' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white transition-transform"
                style={{ transform: markAsPrimary ? 'translateX(16px)' : 'translateX(0px)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 justify-end px-7 py-5" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-70"
            style={{ fontSize: '14px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            {t('cl.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-semibold text-white transition-opacity flex items-center gap-2"
            style={{ fontSize: '14px', background: 'var(--color-accent)', opacity: loading ? 0.4 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? t('upload.uploading') : editing ? t('cl.saveEdit') : t('cl.saveNew')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
