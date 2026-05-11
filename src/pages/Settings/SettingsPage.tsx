import { useState, useRef, useMemo, useEffect } from 'react'
import { User, Palette, Database, Check, ChevronDown, Shield, AlertTriangle, Lock, Phone, Loader2 } from 'lucide-react'
import { exportCSV, exportPDF } from '@/services/export.service'
import { useClickOutside } from '@/hooks/useClickOutside'
import { SuccessToast } from '@/components/ui/SuccessToast'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/pages/Dashboard/components/Sidebar'
import Header from '@/pages/Dashboard/components/Header'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { InputField } from '@/components/ui/InputField'
import { CVPrincipalCard } from './components/CVPrincipalCard'
import { CoverLetterPrincipalCard } from './components/CoverLetterPrincipalCard'
import { useTheme, themes } from '@/context/ThemeContext'
import { useLang } from '@/context/LanguageContext'

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Engineer',
  'Data Scientist',
  'UX/UI Designer',
  'Product Manager',
  'Project Manager',
  'QA Engineer',
  'Tech Lead',
  'CTO',
  'Engineering Manager',
  'Scrum Master',
]

function RoleSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const filtered = ROLE_OPTIONS.filter(r => r.toLowerCase().includes(input.toLowerCase()))

  function select(r: string) {
    setInput(r)
    onChange(r)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
        {t('settings.rolLabel')}
      </label>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={t('settings.rolPlaceholder')}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-9"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
      </div>
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
        >
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((r) => (
              <button
                key={r}
                onMouseDown={() => select(r)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                style={{
                  color: value === r ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                  background: value === r ? 'var(--color-accent-light)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (value !== r) e.currentTarget.style.background = 'var(--color-bg)' }}
                onMouseLeave={(e) => { if (value !== r) e.currentTarget.style.background = 'transparent' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface DeleteModalProps {
  confirmText: string
  onConfirmTextChange: (v: string) => void
  deleting: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

function DeleteAccountModal({ confirmText, onConfirmTextChange, deleting, error, onConfirm, onClose }: DeleteModalProps) {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  const confirmWord = t('delete.word')
  const canDelete = confirmText === confirmWord && !deleting

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      style={{
        background: visible ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(10px)' : 'blur(0px)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0px)' : 'scale(0.88) translateY(32px)',
          transition: 'opacity 0.32s cubic-bezier(0.16,1,0.3,1), transform 0.32s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div
          className="w-[460px] rounded-3xl overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(239,68,68,0.3)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.1)',
          }}
        >
          {/* Red top glow line */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />

          <div className="flex flex-col items-center pt-10 pb-6 px-8">
            {/* Animated icon */}
            <div
              className="relative flex items-center justify-center mb-6"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(12px)',
                transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
              }}
            >
              <div className="absolute rounded-full" style={{ width: 84, height: 84, background: 'rgba(239,68,68,0.08)', animation: 'ping-slow 2.4s ease-out infinite' }} />
              <div className="absolute rounded-full" style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.12)' }} />
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 8px 24px rgba(239,68,68,0.25)' }}
              >
                <AlertTriangle size={26} style={{ color: '#ef4444' }} />
              </div>
            </div>

            {/* Text */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.35s ease 0.18s, transform 0.35s cubic-bezier(0.16,1,0.3,1) 0.18s',
                textAlign: 'center',
              }}
            >
              <h2 className="text-xl font-black mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                {t('delete.title')}
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)', maxWidth: 320, margin: '0 auto 24px' }}>
                {t('delete.desc')}
              </p>
            </div>

            {/* Input */}
            <div
              className="w-full"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.35s ease 0.26s, transform 0.35s cubic-bezier(0.16,1,0.3,1) 0.26s',
              }}
            >
              <label className="block text-xs font-semibold mb-1.5 tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {t('delete.type')} <span style={{ color: '#ef4444' }}>{confirmWord}</span> {t('delete.toConfirm')}
              </label>
              <input
                value={confirmText}
                onChange={(e) => onConfirmTextChange(e.target.value)}
                placeholder={confirmWord}
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${confirmText === confirmWord ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.25)'}`,
                  color: 'var(--color-text-primary)',
                  boxShadow: confirmText === confirmWord ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
            </div>

            {error && (
              <p className="text-xs mt-3 px-3 py-2 rounded-lg w-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</p>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--color-border)', margin: '0 24px' }} />

          {/* Buttons */}
          <div
            className="flex gap-3 px-6 py-5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s',
            }}
          >
            <button
              onClick={close}
              className="flex-1 py-3 rounded-2xl font-semibold transition-all hover:opacity-80 active:scale-95"
              style={{ fontSize: 14, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              {t('delete.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={!canDelete}
              className="flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95"
              style={{
                fontSize: 14,
                background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)',
                opacity: canDelete ? 1 : 0.4,
                cursor: canDelete ? 'pointer' : 'not-allowed',
                boxShadow: canDelete ? '0 4px 20px rgba(239,68,68,0.45)' : 'none',
                transition: 'opacity 0.2s, box-shadow 0.2s',
              }}
            >
              <AlertTriangle size={15} />
              {deleting ? t('delete.deleting') : t('delete.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useLang()
  const { theme, setThemeById } = useTheme()
  const { user } = useAuth()

  // Detect auth providers from user identities
  const identityProviders = user?.identities?.map((i) => i.provider) ?? []
  const hasGoogle = identityProviders.includes('google')
  const hasPassword = identityProviders.includes('email')

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = ((user?.user_metadata?.full_name as string) ?? user?.email ?? 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  const initialFullName = (user?.user_metadata?.full_name as string) ?? ''
  const initialRole    = (user?.user_metadata?.role as string) ?? ''
  const initialEmail   = user?.email ?? ''
  const initialPhone   = (user?.user_metadata?.phone as string) ?? ''

  const [fullName, setFullName] = useState(initialFullName)
  const [role, setRole]         = useState(initialRole)
  const [email, setEmail]       = useState(initialEmail)
  const [phone, setPhone]       = useState(initialPhone)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  // Change password
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Export
  const [exportingCSV, setExportingCSV] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  async function handleExportCSV() {
    if (exportingCSV) return
    setExportingCSV(true)
    try { await exportCSV(fullName || 'usuario') }
    catch (e) { console.error(e) }
    finally { setExportingCSV(false) }
  }

  async function handleExportPDF() {
    if (exportingPDF) return
    setExportingPDF(true)
    try { await exportPDF(fullName || 'Usuario', role) }
    catch (e) { console.error(e) }
    finally { setExportingPDF(false) }
  }

  const hasChanges = useMemo(
    () => (fullName !== initialFullName || role !== initialRole || email !== initialEmail || phone !== initialPhone) && !phoneError,
    [fullName, role, email, phone, phoneError]
  )

  function validatePhone(val: string) {
    if (!val) { setPhoneError(null); return true }
    const clean = val.replace(/[\s\-().+]/g, '')
    if (!/^\d{7,15}$/.test(clean)) { setPhoneError(t('settings.phoneError')); return false }
    setPhoneError(null)
    return true
  }

  async function handleSave() {
    if (!user) return
    if (!validatePhone(phone)) return
    setSaving(true)
    setSaveError(null)
    try {
      const { supabase } = await import('../../lib/supabase')

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, role, phone },
      })
      if (authError) throw authError

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email, full_name: fullName, role })
      if (profileError) throw profileError

      setSaved(true)
      setShowToast(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setSaveError(err.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) { setPasswordError(t('settings.pwErrorFields')); return }
    if (newPassword !== confirmPassword) { setPasswordError(t('settings.pwErrorMatch')); return }
    if (newPassword.length < 8) { setPasswordError(t('settings.pwErrorLength')); return }
    setPasswordSaving(true)
    setPasswordError(null)
    try {
      const { supabase } = await import('../../lib/supabase')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordSection(false)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: any) {
      setPasswordError(err.message ?? 'Error al cambiar contraseña')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (!user) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const { supabase } = await import('../../lib/supabase')
      // Delete profile data first
      await supabase.from('profiles').delete().eq('id', user.id)
      // Delete user via admin API — calls edge function or uses service role
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (err: any) {
      // If RPC doesn't exist, sign out anyway after deleting profile data
      setDeleteError(null)
      const { supabase } = await import('../../lib/supabase')
      await supabase.auth.signOut()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {showToast && (
        <div className="fixed top-6 left-1/2 z-[60]" style={{ transform: 'translateX(-50%)' }}>
          <SuccessToast message={t('toast.profileSaved')} onDismiss={() => setShowToast(false)} />
        </div>
      )}
      {passwordSuccess && (
        <div className="fixed top-6 left-1/2 z-[60]" style={{ transform: 'translateX(-50%)' }}>
          <SuccessToast message={t('toast.passwordSaved')} onDismiss={() => setPasswordSuccess(false)} />
        </div>
      )}
      {showDeleteModal && (
        <DeleteAccountModal
          confirmText={deleteConfirmText}
          onConfirmTextChange={setDeleteConfirmText}
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDeleteAccount}
          onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(null) }}
        />
      )}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-7">
            <h1 className="text-4xl font-black" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
              {t('settings.title')}
            </h1>
            <p className="text-base mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {t('settings.subtitle')}
            </p>
          </div>

          <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: '1fr 480px' }}>
            {/* Perfil de Usuario */}
            <Card>
              <SectionTitle icon={User} label={t('settings.profile')} />
              <div className="flex flex-col gap-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg"
                    style={{ background: 'var(--color-accent-light)', border: '2px solid var(--color-accent-border)', color: 'var(--color-accent-text)' }}
                  >
                    {avatarUrl
                      ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : initials
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{fullName || t('settings.noName')}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{email}</p>
                    {avatarUrl && <p className="text-xs mt-1" style={{ color: 'var(--color-accent-text)' }}>{t('settings.googlePhoto')}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label={t('settings.fullName')} value={fullName} onChange={setFullName} />
                  <RoleSelector value={role} onChange={setRole} />
                </div>
                <InputField label={t('settings.email')} value={email} onChange={setEmail} type="email" />

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
                      {t('settings.phone')}
                    </label>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)', opacity: 0.45 }}>{t('settings.phoneHint')}</span>
                  </div>
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors"
                    style={{ background: 'var(--color-bg)', border: `1px solid ${phoneError ? '#ef4444' : 'var(--color-border)'}` }}
                    onFocus={() => {}}
                  >
                    <Phone size={14} style={{ color: phoneError ? '#ef4444' : 'var(--color-text-muted)', flexShrink: 0 }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (phoneError) validatePhone(e.target.value) }}
                      onBlur={() => validatePhone(phone)}
                      placeholder={t('settings.phonePlaceholder')}
                      className="w-full bg-transparent outline-none text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs" style={{ color: '#ef4444' }}>{phoneError}</p>
                  )}
                </div>

                {saveError && (
                  <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {saveError}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold text-white transition-all"
                    style={{ background: saved ? '#22c55e' : 'var(--color-accent)', opacity: (!hasChanges || saving) ? 0.45 : 1, cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer' }}
                  >
                    {saved ? <><Check size={16} /> {t('settings.saved')}</> : saving ? t('settings.saving') : t('settings.saveChanges')}
                  </button>
                </div>
              </div>
            </Card>

            {/* Export Data — follows theme like other cards */}
            <div
              className="rounded-xl p-7 flex flex-col h-full"
              style={{
                background: 'var(--color-surface)',
                backgroundImage: 'radial-gradient(circle at bottom left, var(--color-accent-border) 0%, transparent 60%)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-accent)' }}
                >
                  <Database size={18} color="#ffffff" />
                </div>
                <h2 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-text-primary)' }}>
                  {t('settings.exportTitle')}
                </h2>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {t('settings.exportDesc')}
              </p>

              <div className="flex flex-col gap-3 mt-auto pt-6">
                <button
                  onClick={handleExportCSV}
                  disabled={exportingCSV}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '15px', opacity: exportingCSV ? 0.6 : 1 }}
                >
                  {exportingCSV
                    ? <Loader2 size={15} className="animate-spin" />
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                      </svg>
                  }
                  {exportingCSV ? t('export.loading') : t('settings.exportCSV')}
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--color-accent)', fontSize: '15px', opacity: exportingPDF ? 0.6 : 1 }}
                >
                  {exportingPDF
                    ? <Loader2 size={15} className="animate-spin" />
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                  }
                  {exportingPDF ? t('export.loading') : t('settings.exportPDF')}
                </button>
              </div>
            </div>

            {/* CV + Carta — 2 columnas iguales */}
            <div className="col-span-2 grid grid-cols-2 gap-5">
              <CVPrincipalCard />
              <CoverLetterPrincipalCard />
            </div>

            {/* Seguridad */}
            <Card className="col-span-2">
              <SectionTitle icon={Shield} label={t('settings.security')} />

              {/* Google identity row */}
              {hasGoogle && (
                <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.25)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Google</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t('settings.googleLinked')}</p>
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
                  >
                    <Check size={11} strokeWidth={3} /> {t('settings.linked')}
                  </span>
                </div>
              )}

              {/* Password row — only if they have email identity */}
              {hasPassword && (
                <div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
                        <Lock size={13} style={{ color: 'var(--color-accent-text)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('settings.password')}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t('settings.passwordDesc')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordSection((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: showPasswordSection ? 'var(--color-accent-light)' : 'var(--color-bg)', border: `1px solid ${showPasswordSection ? 'var(--color-accent-border)' : 'var(--color-border)'}`, color: showPasswordSection ? 'var(--color-accent-text)' : 'var(--color-text-muted)' }}
                    >
                      <Lock size={13} />
                      {showPasswordSection ? t('settings.cancelPw') : t('settings.changePw')}
                    </button>
                  </div>

                  {showPasswordSection && (
                    <div className="pb-4 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label={t('settings.newPw')} value={newPassword} onChange={setNewPassword} type="password" />
                        <InputField label={t('settings.confirmPw')} value={confirmPassword} onChange={setConfirmPassword} type="password" />
                      </div>
                      {passwordError && (
                        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                          {passwordError}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={handleChangePassword}
                          disabled={passwordSaving}
                          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                          style={{ background: 'var(--color-accent)' }}
                        >
                          {passwordSaving ? t('settings.updatingPw') : t('settings.updatePw')}
                        </button>
                        <button
                          onClick={() => { setShowPasswordSection(false); setPasswordError(null); setNewPassword(''); setConfirmPassword('') }}
                          className="px-5 py-2.5 rounded-lg text-sm font-medium"
                          style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                        >
                          {t('settings.cancelPw')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Only Google — no password option */}
              {hasGoogle && !hasPassword && (
                <div className="mt-3 px-4 py-3 rounded-xl flex items-center gap-2" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <Shield size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('settings.onlyGoogle')}
                  </p>
                </div>
              )}
            </Card>

            {/* Apariencia */}
            <Card className="col-span-2">
              <SectionTitle icon={Palette} label={t('settings.appearance')} />
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                {t('settings.appearanceDesc')}
              </p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {themes.map((t) => {
                  const isActive = theme.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setThemeById(t.id)}
                      className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left w-full"
                      style={{
                        background: isActive ? t.accentLight : 'var(--color-bg)',
                        border: isActive ? `2px solid ${t.accent}` : '2px solid var(--color-border)',
                        transform: isActive ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: isActive ? `0 0 20px ${t.accent}35` : 'none',
                      }}
                    >
                      {/* Color preview dots */}
                      <div className="flex items-center -space-x-1.5">
                        {t.preview.map((color, i) => (
                          <div
                            key={i}
                            className="rounded-full border-2"
                            style={{
                              width: i === 0 ? 24 : 20,
                              height: i === 0 ? 24 : 20,
                              background: color,
                              borderColor: 'var(--color-surface)',
                              zIndex: t.preview.length - i,
                            }}
                          />
                        ))}
                      </div>

                      {/* Label + check */}
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-sm font-bold leading-none" style={{ color: isActive ? t.accentText : 'var(--color-text-primary)' }}>
                            {t.label}
                          </span>
                          {isActive && (
                            <span
                              className="flex items-center justify-center rounded-full shrink-0"
                              style={{ width: 16, height: 16, background: t.accent }}
                            >
                              <Check size={9} color="#fff" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                          {t.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Zona de Peligro — siempre al final */}
            <div
              className="col-span-2 rounded-xl p-7"
              style={{ background: 'var(--color-surface)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                </div>
                <h2 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#ef4444' }}>
                  {t('settings.dangerZone')}
                </h2>
              </div>

              <div className="flex items-center justify-between py-4" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('settings.deleteAccount')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {t('settings.deleteDesc')}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0 ml-8"
                  style={{ background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
                >
                  <AlertTriangle size={14} />
                  {t('settings.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
