import { useState, useRef } from 'react'
import { FileText, Star, ChevronDown, Check, Lock, FolderOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useCoverLetter } from '@/context/CoverLetterContext'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useLang } from '@/context/LanguageContext'

export function CoverLetterPrincipalCard() {
  const { t } = useLang()
  const { coverLetters, primaryCLId, setPrimaryCLId } = useCoverLetter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const primary = coverLetters.find((c) => c.id === primaryCLId)
  const onlyOne = coverLetters.length === 1
  const empty = coverLetters.length === 0

  useClickOutside(ref, () => setOpen(false))

  return (
    <Card>
      <SectionTitle icon={FileText} label={t('clCard.title')} />
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        {t('clCard.desc')}
      </p>

      {/* Empty state */}
      {empty && (
        <div
          className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl"
          style={{ background: 'var(--color-bg)', border: '1px dashed var(--color-border)' }}
        >
          <FolderOpen size={22} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('clCard.empty')}</p>
        </div>
      )}

      {/* Single item — locked, no dropdown */}
      {onlyOne && (
        <div>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-accent-border)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-light)' }}>
              <FileText size={14} style={{ color: 'var(--color-accent-text)' }} />
            </div>
            <span className="flex-1 text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {coverLetters[0].name}
            </span>
            <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b', flexShrink: 0 }} />
            <Lock size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: 4 }} />
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t('clCard.onlyOne')}
          </p>
        </div>
      )}

      {/* Multiple items — dropdown selector */}
      {!empty && !onlyOne && (
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              background: 'var(--color-bg)',
              border: `1.5px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-light)' }}>
              <FileText size={14} style={{ color: 'var(--color-accent-text)' }} />
            </div>
            <span className="flex-1 text-sm font-semibold truncate" style={{ color: primary ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
              {primary ? primary.name : t('clCard.select')}
            </span>
            {primary && <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b', flexShrink: 0 }} />}
            <ChevronDown
              size={15}
              style={{
                color: 'var(--color-text-muted)',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0,
              }}
            />
          </button>

          {open && (
            <div
              className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-10"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              {coverLetters.map((cl) => {
                const isSelected = primaryCLId === cl.id
                return (
                  <button
                    key={cl.id}
                    onClick={() => { setPrimaryCLId(isSelected ? null : cl.id); setOpen(false) }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background: isSelected ? 'var(--color-accent-light)' : 'transparent',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: isSelected ? 'var(--color-accent)' : 'var(--color-accent-light)' }}
                    >
                      <FileText size={12} style={{ color: isSelected ? '#fff' : 'var(--color-accent-text)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {cl.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {cl.preview}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{cl.date}</span>
                      {isSelected && <Check size={14} style={{ color: 'var(--color-accent-text)' }} />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {primary && !onlyOne && (
        <div
          className="mt-4 px-4 py-3 rounded-xl"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            {t('clCard.preview')}
          </p>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
            {primary.preview}
          </p>
        </div>
      )}
    </Card>
  )
}
