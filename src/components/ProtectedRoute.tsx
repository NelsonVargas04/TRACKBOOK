import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { BrandLoader } from '@/components/BrandLoader'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <BrandLoader />
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
