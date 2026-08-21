import { useState } from 'react'
import { Mail, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'

type Step = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginForm() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signInWithMagicLink, signInWithGoogle } = useAuth()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStep('sending')
    setError(null)
    try {
      await signInWithMagicLink(email)
      setStep('sent')
    } catch (err: any) {
      setError(err.message ?? 'Error al enviar el link')
      setStep('error')
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message ?? 'Error al conectar con Google')
      setGoogleLoading(false)
    }
  }

  if (step === 'sent') {
    return (
      <div className="w-full max-w-[400px] flex flex-col">
        <div
          className="w-full rounded-2xl flex flex-col items-center text-center px-8 py-10 mb-5"
          style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}
        >
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute rounded-full" style={{ width: 72, height: 72, background: 'var(--color-accent-light)', animation: 'ping-slow 2s ease-out infinite' }} />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)' }}>
              <Mail size={24} style={{ color: 'var(--color-accent-text)' }} />
            </div>
          </div>

          <h2 className="font-black mb-2" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '22px', color: '#f9fafb', letterSpacing: '-0.02em' }}>
            {t('login.checkEmail')}
          </h2>

          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', marginBottom: 4 }}>
            {t('login.sentTo')}
          </p>
          <p className="font-semibold mb-5" style={{ fontSize: '14px', color: 'var(--color-accent-text)', wordBreak: 'break-all' }}>
            {email}
          </p>

          <div className="w-full rounded-xl px-4 py-3 mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.7', margin: 0 }}>
              {t('login.instructions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => { setStep('idle'); setEmail('') }}
          className="w-full rounded-xl py-3 font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280', fontSize: '13px' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#9ca3af')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
        >
          {t('login.useOther')}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col">
      <div className="mb-8">
        <h1 className="font-black tracking-tight mb-2" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', color: '#f9fafb', letterSpacing: '-0.02em' }}>
          {t('login.title')}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          {t('login.subtitle')}
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 font-semibold transition-all active:scale-[0.98] mb-5"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f9fafb', fontSize: '14px' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
      >
        {googleLoading ? <Loader2 size={16} className="animate-spin" style={{ color: '#9ca3af' }} /> : <GoogleIcon />}
        {googleLoading ? t('login.connecting') : t('login.google')}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: '11px', color: '#374151', letterSpacing: '0.12em' }}>{t('login.orEmail')}</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#4b5563', textTransform: 'uppercase' }}>
            {t('login.email')}
          </label>
          <div className="relative">
            <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#374151' }} />
            <input
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); if (step === 'error') setStep('idle') }}
              required
              className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#f9fafb', colorScheme: 'dark' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-accent-light)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#ef4444' }}>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={step === 'sending'}
          className="w-full rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 72%, #fff) 100%)', color: '#fff', fontSize: '13px', letterSpacing: '0.06em', boxShadow: '0 4px 20px var(--color-accent-border)', opacity: step === 'sending' ? 0.7 : 1 }}
          onMouseEnter={(e) => { if (step !== 'sending') { e.currentTarget.style.boxShadow = '0 6px 28px var(--color-accent-border)'; e.currentTarget.style.filter = 'brightness(1.06)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px var(--color-accent-border)'; e.currentTarget.style.filter = 'none' }}
        >
          {step === 'sending'
            ? <><Loader2 size={15} className="animate-spin" /> {t('login.sending')}</>
            : <><Mail size={14} /> {t('login.sendLink')}</>
          }
        </button>

        <p className="text-center" style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6' }}>
          {t('login.hint')}
        </p>
      </form>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
