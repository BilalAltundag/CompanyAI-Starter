'use client'

import { Navigation } from '@/components/layout/navigation'
import { Dashboard } from '@/components/dashboard/dashboard'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <Dashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
