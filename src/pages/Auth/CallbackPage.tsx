import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'

export default function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard', { replace: true })
        return
      }

      // Buscar code en query params
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
      const code = searchParams.get('code') || hashParams.get('code')
      const accessToken = hashParams.get('access_token')

      if (accessToken) {
        // Token implicit flow — dejar que Supabase lo procese
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            navigate(data.session ? '/dashboard' : '/login', { replace: true })
          })
        }, 500)
      } else if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ data }) => {
          navigate(data.session ? '/dashboard' : '/login', { replace: true })
        })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: '#16171f' }}>
      <Spinner size={32} />
    </div>
  )
}
