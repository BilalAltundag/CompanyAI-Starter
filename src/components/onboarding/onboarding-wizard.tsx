'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { DepartmentStep } from './department-step'
import { UserStep } from './user-step'
import { DataStep } from './data-step'
import { Department, User, StoredFile } from '@/types'
import { seedGeneralFiles, getDataTypeFromExtension, formatFileSize } from '@/lib/file-utils'

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps = [
    { title: 'Departmanlar', description: 'Şirket departmanlarını seçin' },
    { title: 'Kullanıcılar', description: 'Kullanıcıları ve departman atamalarını yapın' },
    { title: 'Veri Alanları', description: 'Veri yükleme alanlarını hazırlayın' },
    { title: 'Kurulum Tamamlandı', description: 'Sistem hazır!' }
  ]

  const handleComplete = async (uploadedFiles: File[]) => {
    setIsCompleting(true)

    try {
      const now = new Date().toISOString()

      // Genel alanı seed et + kullanıcı yüklemeleri
      const seededGeneral = seedGeneralFiles()
      const uploadedGeneral: StoredFile[] = uploadedFiles.map((file, index) => ({
        id: `uploaded-${index}`,
        name: file.name,
        type: getDataTypeFromExtension(file.name),
        area: 'general',
        sizeLabel: formatFileSize(file.size),
        sizeBytes: file.size,
        uploadedAt: now,
        uploadedBy: 'Siz',
        isGeneral: true,
      }))

      const allFiles = [...uploadedGeneral, ...seededGeneral]

      // Dosyaları işle (şimdilik sadece metadata al)
      const processedFiles = await Promise.all(
        uploadedFiles.map(async (file, index) => ({
          id: `uploaded-${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }))
      )

      // Verileri localStorage'a kaydet
      const onboardingData = {
        departments,
        users,
        uploadedFiles: processedFiles,
        files: allFiles,
        completedAt: new Date().toISOString(),
        version: '1.0'
      }

      localStorage.setItem('company-ai-onboarding', JSON.stringify(onboardingData))
      localStorage.setItem('company-ai-setup-completed', 'true')
      localStorage.setItem('company-ai-files', JSON.stringify(allFiles))

      // Simüle edilmiş işlem süresi
      await new Promise(resolve => setTimeout(resolve, 2000))

      setIsCompleted(true)
      setCurrentStep(3)

      // 3 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (error) {
      console.error('Onboarding completion error:', error)
      setIsCompleting(false)
    } finally {
      setIsCompleting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DepartmentStep
            selectedDepartments={departments}
            onDepartmentsChange={setDepartments}
            onNext={() => setCurrentStep(1)}
          />
        )
      case 1:
        return (
          <UserStep
            departments={departments}
            users={users}
            onUsersChange={setUsers}
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
          />
        )
      case 2:
        return (
          <DataStep
            onComplete={handleComplete}
            onBack={() => setCurrentStep(1)}
          />
        )
      case 3:
        return (
          <div className="text-center space-y-6">
            {isCompleted ? (
              <>
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Kurulumu Başarıyla Tamamlandı! 🎉
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Company AI sisteminiz hazır. Artık verilerinizi yönetebilir ve
                    departmanlarınız için akıllı chatbotları kullanabilirsiniz.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Oluşturulan Yapı:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• {departments.length} departman oluşturuldu</li>
                    <li>• {users.length} kullanıcı eklendi</li>
                    <li>• Genel veri alanı hazırlandı</li>
                    <li>• Güvenlik politikaları aktif edildi</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500">
                  Dashboard'a yönlendiriliyorsunuz...
                </p>
              </>
            ) : isCompleting ? (
              <>
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Kurulum Tamamlanıyor...
                  </h2>
                  <p className="text-gray-600">
                    Sistem ayarları yapılıyor ve verileriniz kaydediliyor.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 mt-1">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
