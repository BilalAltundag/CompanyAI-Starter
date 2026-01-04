'use client'

import { Navigation } from '@/components/layout/navigation'
import { DataManagement } from '@/components/data/data-management'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DataPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <DataManagement />
        </main>
      </div>
    </ProtectedRoute>
  )
}
