import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[Callback] href completo:', window.location.href)
    console.log('[Callback] search:', window.location.search)
    console.log('[Callback] hash:', window.location.hash)

    supabase.auth.getSession().then(({ data }) => {
      console.log('[Callback] session inicial:', data.session?.user?.email ?? null)
      if (data.session) {
        navigate('/dashboard', { replace: true })
        return
      }

      // Buscar code en query params
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
      const code = searchParams.get('code') || hashParams.get('code')
      const accessToken = hashParams.get('access_token')

      console.log('[Callback] code:', code)
      console.log('[Callback] access_token en hash:', accessToken ? 'SÍ' : 'NO')

      if (accessToken) {
        // Token implicit flow — dejar que Supabase lo procese
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            console.log('[Callback] session tras espera:', data.session?.user?.email)
            navigate(data.session ? '/dashboard' : '/login', { replace: true })
          })
        }, 500)
      } else if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          console.log('[Callback] exchangeCode:', data.session?.user?.email, error?.message)
          navigate(data.session ? '/dashboard' : '/login', { replace: true })
        })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: '#16171f' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7C6FCD', borderTopColor: 'transparent' }} />
    </div>
  )
}
