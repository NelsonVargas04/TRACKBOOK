import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const SESSION_TS_KEY = 'hb_session_ts'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

function stampSession() {
  localStorage.setItem(SESSION_TS_KEY, Date.now().toString())
}

function isSessionExpired(): boolean {
  const ts = localStorage.getItem(SESSION_TS_KEY)
  if (!ts) return false // no stamp = fresh login, let Supabase decide
  return Date.now() - parseInt(ts) > SESSION_TTL_MS
}

function clearSessionStamp() {
  localStorage.removeItem(SESSION_TS_KEY)
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signInWithMagicLink: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session && isSessionExpired()) {
        // Session older than 24h — force logout
        clearSessionStamp()
        await supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(data.session)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] evento:', event, '| session:', session?.user?.email ?? null)
      if (event === 'SIGNED_IN' && session) {
        stampSession()
        setSession(session)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        clearSessionStamp()
        setSession(null)
      } else {
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUpWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  async function signOut() {
    localStorage.removeItem('hb_last_activity')
    localStorage.removeItem('hb-primary-cv')
    localStorage.removeItem('hb-primary-cl')
    localStorage.removeItem('hb-theme')
    clearSessionStamp()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithMagicLink,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
