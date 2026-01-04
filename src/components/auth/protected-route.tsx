'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { hydrated, isSetupCompleted, isAuthenticated, currentUser } = useAuth()

  useEffect(() => {
    if (hydrated) {
      if (!isSetupCompleted) {
        router.push('/kurulum')
      } else if (!isAuthenticated) {
        router.push('/giris')
      } else if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
        // User doesn't have required role
        router.push('/dashboard')
      }
    }
  }, [hydrated, isSetupCompleted, isAuthenticated, currentUser, allowedRoles, router])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isSetupCompleted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Bu sayfaya erişim yetkiniz yok</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

