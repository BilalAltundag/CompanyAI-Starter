'use client'

import { Navigation } from '@/components/layout/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Shield, Building2, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { currentUser, getDepartment } = useAuth()
  const department = currentUser?.departmentId ? getDepartment(currentUser.departmentId) : null

  const roleLabels = {
    admin: 'Yönetici',
    leader: 'Departman Lideri',
    employee: 'Çalışan'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Bilgileri
              </CardTitle>
              <CardDescription>Hesap bilgilerinizi görüntüleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentUser?.fullName}</h2>
                  <p className="text-gray-500">@{currentUser?.username}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Mail className="h-4 w-4" />
                    E-posta
                  </div>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Shield className="h-4 w-4" />
                    Rol
                  </div>
                  <p className="font-medium">{roleLabels[currentUser?.role || 'employee']}</p>
                </div>

                {department && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Building2 className="h-4 w-4" />
                      Departman
                    </div>
                    <p className="font-medium">{department.name}</p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Kayıt Tarihi
                  </div>
                  <p className="font-medium">
                    {currentUser?.createdAt 
                      ? new Date(currentUser.createdAt).toLocaleDateString('tr-TR')
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
