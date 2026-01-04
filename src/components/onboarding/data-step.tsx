'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Database, Presentation, Image, Video, Music, Code, Link } from 'lucide-react'
import { DATA_TYPES } from '@/lib/constants'
import { DataType } from '@/types'

interface DataStepProps {
  onComplete: (uploadedFiles: File[]) => void
  onBack: () => void
}

const getDataTypeIcon = (type: DataType) => {
  const icons = {
    text_documents: FileText,
    data_files: Database,
    presentations: Presentation,
    images: Image,
    videos: Video,
    audio: Music,
    structured_data: Code,
    external_links: Link
  }
  return icons[type] || FileText
}

export function DataStep({ onComplete, onBack }: DataStepProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Örnek şirket dosyaları
  const sampleCompanyFiles = [
    { name: 'Şirket Tüzüğü.pdf', size: '2.4 MB', type: 'text_documents' as DataType },
    { name: 'Kurumsal Politika Rehberi.docx', size: '1.8 MB', type: 'text_documents' as DataType },
    { name: 'Organizasyon Şeması.pdf', size: '856 KB', type: 'text_documents' as DataType },
    { name: 'Çalışan El Kitabı.pdf', size: '3.2 MB', type: 'text_documents' as DataType }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeSampleFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Veri Alanlarını Hazırlayın</h2>
        <p className="text-gray-600 mt-2">
          Sistem otomatik olarak veri yükleme alanlarını oluşturdu
        </p>
      </div>

      {/* Genel Alan - Şirket Bilgileri */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Genel Alan - Şirket Bilgileri
          </CardTitle>
          <CardDescription>
            Tüm departmanlar ve kullanıcılar tarafından erişilebilir temel şirket dokümanları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Örnek Şirket Dosyaları */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Örnek Şirket Dokümanları</h4>
              <div className="space-y-2">
                {sampleCompanyFiles.map((file, index) => {
                  const Icon = getDataTypeIcon(file.type)
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">({file.size})</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Hazır
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Bu örnek dosyalar kurulumu tamamladığınızda sisteme yüklenecektir.
              </p>
            </div>

            {/* Ek Dosya Yükleme */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Ek şirket dokümanları yükleyin</p>
              <p className="text-xs text-gray-500">
                PDF, Word, Excel, görseller ve diğer desteklenen formatlar
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept={DATA_TYPES.flatMap(dt => dt.extensions).join(',')}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.querySelector('input[type="file"]')?.click()}
              >
                Dosya Seç
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desteklenen Veri Tipleri */}
      <Card>
        <CardHeader>
          <CardTitle>Desteklenen Veri Tipleri</CardTitle>
          <CardDescription>
            Aşağıdaki formatlarda dosya yükleyebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DATA_TYPES.map((dataType) => {
              const Icon = getDataTypeIcon(dataType.id)
              return (
                <div key={dataType.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-sm">{dataType.name}</h4>
                    <p className="text-xs text-gray-600">{dataType.extensions.join(', ')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Yüklenen Dosyalar */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yüklenen Dosyalar ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Kaldır
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Geri
        </Button>
        <Button onClick={() => onComplete(uploadedFiles)}>
          Kurulumu Tamamla
        </Button>
      </div>
    </div>
  )
}
