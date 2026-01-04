'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Upload,
  FileText,
  Database,
  Presentation,
  Image,
  Video,
  Music,
  Code,
  Link as LinkIcon,
  Trash2,
  Eye,
  Download,
  Plus,
  X
} from 'lucide-react'
import { DATA_TYPES } from '@/lib/constants'
import { DataType, StoredFile } from '@/types'

interface PersonalDataManagerProps {
  personalFiles: StoredFile[]
  onAddFiles: (files: File[]) => void
  onRemoveFile: (fileId: string) => void
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
    external_links: LinkIcon
  }
  return icons[type] || FileText
}

export function PersonalDataManager({ personalFiles, onAddFiles, onRemoveFile }: PersonalDataManagerProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    setIsUploading(true)
    onAddFiles(files)
    setIsUploading(false)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kişisel Veri Yönetimi</h2>
          <p className="text-gray-600">Sadece sizin erişebileceğiniz özel verilerinizi yönetin</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="personal-file-upload"
            accept={DATA_TYPES.flatMap(dt => dt.extensions).join(',')}
          />
          <Button
            onClick={() => document.getElementById('personal-file-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Yükleniyor...' : 'Dosya Yükle'}
          </Button>
        </div>
      </div>

      {/* Dosya Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Kişisel Dosyalarınız ({personalFiles.length})</CardTitle>
          <CardDescription>
            Bu dosyalar sadece sizin tarafınızdan görülebilir ve yönetilebilir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personalFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz dosya yüklenmemiş</h3>
              <p className="text-gray-600 mb-4">
                Kişisel notlarınız, özel dokümanlarınız veya çalışma dosyalarınızı yükleyin
              </p>
              <Button onClick={() => document.getElementById('personal-file-upload')?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Dosyanızı Yükleyin
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {personalFiles.map((file) => {
                const Icon = getDataTypeIcon(file.type)
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-purple-600" />
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-600">
                          {DATA_TYPES.find(dt => dt.id === file.type)?.name} • {file.sizeLabel} • {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveFile(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                  <Icon className="h-6 w-6 text-purple-600" />
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

    </div>
  )
}
