import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signUpWithEmail(form.email, form.password)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message ?? 'Error con Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left side */}
      <div className="w-[45%] shrink-0 flex flex-col justify-between p-12" style={{ background: '#1e1f2e' }}>
        <div>
          <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: '#7C6FCD' }}>TRACKBOOK</span>
        </div>
        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Built for Hunters.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Designed for professionals who are serious about their next move.<br />
            No noise — just signal.
          </p>
        </div>
        <div />
      </div>

      {/* Right side */}
      <div className="w-[55%] flex items-center justify-center" style={{ background: '#16171f' }}>
        <div className="w-full max-w-[480px] px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Create account
            </h1>
            <p className="text-sm text-gray-500">Start tracking your career journey.</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle size={48} style={{ color: '#22c55e' }} />
              <p className="text-white font-semibold">¡Cuenta creada! Redirigiendo...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="email" name="email" placeholder="name@company.com"
                    value={form.email} onChange={handleChange} required
                    style={{ background: '#13131c', colorScheme: 'dark' }}
                    className="w-full rounded-lg pl-9 pr-4 py-3.5 text-base text-white placeholder-gray-700 outline-none border border-white/[0.06] focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="password" name="password" placeholder="••••••••"
                    value={form.password} onChange={handleChange} required
                    style={{ background: '#13131c', colorScheme: 'dark' }}
                    className="w-full rounded-lg pl-9 pr-4 py-3.5 text-base text-white placeholder-gray-700 outline-none border border-white/[0.06] focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">Confirmar Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="password" name="confirm" placeholder="••••••••"
                    value={form.confirm} onChange={handleChange} required
                    style={{ background: '#13131c', colorScheme: 'dark' }}
                    className="w-full rounded-lg pl-9 pr-4 py-3.5 text-base text-white placeholder-gray-700 outline-none border border-white/[0.06] focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={14} style={{ color: '#ef4444' }} />
                  <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full rounded-lg py-4 text-sm font-bold tracking-widest text-white transition-opacity hover:opacity-85 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7C6FCD, #9f6fcd)' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'CREATE ACCOUNT →'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.05]" />
                <span className="text-[10px] tracking-widest text-gray-700 uppercase">or</span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>

              <button
                type="button" onClick={handleGoogle} disabled={googleLoading}
                className="flex items-center justify-center gap-2.5 w-full rounded-lg py-4 text-sm text-gray-400 hover:text-white transition-colors"
                style={{ background: '#13131c', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {googleLoading ? <Loader2 size={14} className="animate-spin" /> : <GoogleIcon />}
                Sign up with Google
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-600">
            ¿Ya tenés cuenta?{' '}
            <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white transition-colors font-semibold">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
