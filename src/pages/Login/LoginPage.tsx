import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import LoginSidebar from './components/LoginSidebar'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, loading, navigate])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-[45%] shrink-0" style={{ background: '#1e1f2e' }}>
        <LoginSidebar />
      </div>
      <div className="w-[55%] flex items-center justify-center" style={{ background: '#16171f' }}>
        <LoginForm />
      </div>
    </div>
  )
}
