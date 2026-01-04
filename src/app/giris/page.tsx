'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, User, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function GirisPage() {
  const router = useRouter()
  const { hydrated, isSetupCompleted, isAuthenticated, login, settings } = useAuth()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect only if already authenticated
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [hydrated, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = login(username, password)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Giriş başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {settings?.companyName || 'Company AI'}
          </h1>
          <p className="text-blue-200">Hesabınıza giriş yapın</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>Kullanıcı adı ve şifrenizi girin</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Warning if setup not completed */}
            {!isSetupCompleted && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm mb-4">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Kurulum Yapılmamış</p>
                  <p className="text-yellow-600">
                    Giriş yapabilmek için önce{' '}
                    <button 
                      onClick={() => router.push('/kurulum')}
                      className="underline hover:text-yellow-800 font-medium"
                    >
                      kurulum
                    </button>{' '}
                    yapmanız gerekiyor.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="kullanici_adi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Beni hatırla</span>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !username || !password || !isSetupCompleted}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-blue-200 text-sm mt-6">
          Hesap bilgilerinizi yöneticinizden alabilirsiniz.
        </p>
      </div>
    </div>
  )
}

