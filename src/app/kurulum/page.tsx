'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
  User, 
  Lock, 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  Users,
  Settings,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface DepartmentInput {
  id: string
  name: string
  description: string
}

export default function KurulumPage() {
  const router = useRouter()
  const { hydrated, isSetupCompleted, completeSetup, login } = useAuth()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form data
  const [companyName, setCompanyName] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminFullName, setAdminFullName] = useState('')
  const [departments, setDepartments] = useState<DepartmentInput[]>([
    { id: '1', name: 'İnsan Kaynakları', description: '' },
    { id: '2', name: 'Finans', description: '' },
    { id: '3', name: 'Satış', description: '' },
  ])

  // Show warning if setup already completed, but allow access
  // No redirect - user can still access the page if they want

  // Validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!companyName.trim()) {
      newErrors.companyName = 'Şirket adı gerekli'
    }

    if (!adminFullName.trim()) {
      newErrors.adminFullName = 'Ad soyad gerekli'
    }

    if (!adminEmail.trim()) {
      newErrors.adminEmail = 'E-posta gerekli'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      newErrors.adminEmail = 'Geçerli bir e-posta girin'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!adminUsername.trim()) {
      newErrors.adminUsername = 'Kullanıcı adı gerekli'
    } else if (adminUsername.length < 4) {
      newErrors.adminUsername = 'En az 4 karakter olmalı'
    } else if (!/^[a-zA-Z0-9_]+$/.test(adminUsername)) {
      newErrors.adminUsername = 'Sadece harf, rakam ve alt çizgi kullanın'
    }

    if (!adminPassword) {
      newErrors.adminPassword = 'Şifre gerekli'
    } else if (adminPassword.length < 8) {
      newErrors.adminPassword = 'En az 8 karakter olmalı'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(adminPassword)) {
      newErrors.adminPassword = 'Büyük harf, küçük harf ve rakam içermeli'
    }

    if (adminPassword !== adminPasswordConfirm) {
      newErrors.adminPasswordConfirm = 'Şifreler eşleşmiyor'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    
    const validDepts = departments.filter(d => d.name.trim())
    if (validDepts.length === 0) {
      newErrors.departments = 'En az bir departman ekleyin'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    } else if (step === 3 && validateStep3()) {
      setStep(4)
    }
  }

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1))
  }

  const addDepartment = () => {
    setDepartments(prev => [...prev, { id: Date.now().toString(), name: '', description: '' }])
  }

  const removeDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id))
  }

  const updateDepartment = (id: string, field: 'name' | 'description', value: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      const validDepts = departments.filter(d => d.name.trim())
      
      const result = completeSetup({
        companyName,
        adminUsername,
        adminPassword,
        adminEmail,
        adminFullName,
        departments: validDepts.map(d => ({ name: d.name, description: d.description || undefined }))
      })

      if (result.success) {
        // Auto login after setup
        login(adminUsername, adminPassword)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Setup failed:', error)
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

  const steps = [
    { number: 1, title: 'Şirket Bilgileri', icon: Building2 },
    { number: 2, title: 'Yönetici Hesabı', icon: Shield },
    { number: 3, title: 'Departmanlar', icon: Users },
    { number: 4, title: 'Özet', icon: Check },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Warning if setup already completed */}
        {isSetupCompleted && (
          <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-300 mb-1">Kurulum Zaten Tamamlanmış</h3>
                  <p className="text-yellow-200/80 text-sm">
                    Sistem kurulumu zaten yapılmış. Giriş yapmak için{' '}
                    <button 
                      onClick={() => router.push('/giris')}
                      className="underline hover:text-yellow-300"
                    >
                      giriş sayfasına
                    </button>{' '}
                    gidebilirsiniz. Yine de bu sayfaya erişebilirsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Company AI Kurulum</h1>
          <p className="text-blue-200">Sisteminizi yapılandırmak için adımları takip edin</p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between mb-8 px-4">
          {steps.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.number
            const isCompleted = step > s.number
            return (
              <div key={s.number} className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                  ${isActive ? 'bg-blue-500 text-white scale-110' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-slate-700 text-slate-400' : ''}
                `}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs text-center ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && (
                  <div className={`absolute w-12 h-0.5 mt-6 ml-24 ${isCompleted ? 'bg-green-500' : 'bg-slate-700'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-2xl">
          {/* Step 1: Company Info */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Şirket Bilgileri
                </CardTitle>
                <CardDescription>Şirketiniz ve yönetici bilgilerini girin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Şirket Adı *</label>
                  <Input
                    placeholder="Örn: ABC Teknoloji A.Ş."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={errors.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yönetici Ad Soyad *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Ad Soyad"
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      className={`pl-10 ${errors.adminFullName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.adminFullName && <p className="text-red-500 text-xs mt-1">{errors.adminFullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yönetici E-posta *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="admin@sirket.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className={`pl-10 ${errors.adminEmail ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Yönetici Hesabı
                </CardTitle>
                <CardDescription>Güvenli bir kullanıcı adı ve şifre belirleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kullanıcı Adı *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value.toLowerCase())}
                      className={`pl-10 ${errors.adminUsername ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.adminUsername && <p className="text-red-500 text-xs mt-1">{errors.adminUsername}</p>}
                  <p className="text-xs text-gray-500 mt-1">En az 4 karakter, harf, rakam ve alt çizgi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Şifre *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className={`pl-10 ${errors.adminPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                  <p className="text-xs text-gray-500 mt-1">En az 8 karakter, büyük/küçük harf ve rakam</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Şifre Tekrar *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      className={`pl-10 ${errors.adminPasswordConfirm ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.adminPasswordConfirm && <p className="text-red-500 text-xs mt-1">{errors.adminPasswordConfirm}</p>}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Departments */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Departmanlar
                </CardTitle>
                <CardDescription>Şirketinizdeki departmanları ekleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.departments && (
                  <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{errors.departments}</p>
                )}
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {departments.map((dept, index) => (
                    <div key={dept.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Departman adı"
                          value={dept.name}
                          onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Açıklama (opsiyonel)"
                          value={dept.description}
                          onChange={(e) => updateDepartment(dept.id, 'description', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDepartment(dept.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={addDepartment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Departman Ekle
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Kurulum Özeti
                </CardTitle>
                <CardDescription>Bilgilerinizi kontrol edin ve kurulumu tamamlayın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Şirket</p>
                    <p className="text-lg font-bold">{companyName}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Yönetici</p>
                    <p className="text-lg font-bold">{adminFullName}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">Hesap Bilgileri</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Kullanıcı:</span> {adminUsername}</p>
                    <p><span className="text-gray-500">E-posta:</span> {adminEmail}</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium mb-2">
                    Departmanlar ({departments.filter(d => d.name.trim()).length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {departments.filter(d => d.name.trim()).map(dept => (
                      <span key={dept.id} className="px-3 py-1 bg-white rounded-full text-sm border">
                        {dept.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Not:</strong> Kurulum tamamlandıktan sonra bu ayarları Dashboard üzerinden değiştirebilirsiniz.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="p-6 pt-0 flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            ) : (
              <div />
            )}
            
            {step < 4 ? (
              <Button onClick={handleNext}>
                İleri
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kuruluyor...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Kurulumu Tamamla
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

