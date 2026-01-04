'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Settings, LogIn, Database } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()
  const { hydrated, isSetupCompleted, isAuthenticated, settings } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  // Eğer zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [hydrated, isAuthenticated, router])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Company AI</h1>
          <p className="text-blue-200">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Company AI</h1>
          <p className="text-blue-200 text-lg">Şirket Yönetim Sistemi</p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Kurulum Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Settings className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Kurulum</CardTitle>
                  <CardDescription className="text-blue-200">
                    İlk kurulum için
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-sm mb-4">
                Şirket bilgilerinizi, departmanları ve yönetici hesabınızı oluşturun.
              </p>
              <Button
                onClick={() => router.push('/kurulum')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Kuruluma Başla
              </Button>
            </CardContent>
          </Card>

          {/* Giriş Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <LogIn className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Giriş Yap</CardTitle>
                  <CardDescription className="text-blue-200">
                    Hesabınıza giriş yapın
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-sm mb-4">
                Kullanıcı adı ve şifrenizle giriş yapabilirsiniz.
              </p>
              <Button
                onClick={() => router.push('/giris')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Giriş Yap
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <Button
              onClick={() => setShowDebug(!showDebug)}
              variant="outline"
              className="w-full text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <Database className="h-4 w-4 mr-2" />
              {showDebug ? 'Debug Bilgilerini Gizle' : 'Debug Bilgilerini Göster'}
            </Button>
            {showDebug && (
              <Card className="mt-4 bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kurulum Durumu:</span>
                      <span className={isSetupCompleted ? 'text-green-400' : 'text-red-400'}>
                        {isSetupCompleted ? 'Tamamlandı' : 'Yapılmadı'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giriş Durumu:</span>
                      <span className={isAuthenticated ? 'text-green-400' : 'text-yellow-400'}>
                        {isAuthenticated ? 'Giriş Yapıldı' : 'Giriş Yapılmadı'}
                      </span>
                    </div>
                    {settings && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Şirket Adı:</span>
                        <span className="text-white">{settings.companyName}</span>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-xs mb-2">localStorage Keys:</p>
                      <div className="space-y-1 text-xs">
                        {['company-ai-users', 'company-ai-departments', 'company-ai-settings', 'company-ai-session'].map(key => {
                          const hasData = typeof window !== 'undefined' && localStorage.getItem(key)
                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500">{key}:</span>
                              <span className={hasData ? 'text-green-400' : 'text-red-400'}>
                                {hasData ? '✓ Var' : '✗ Yok'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
