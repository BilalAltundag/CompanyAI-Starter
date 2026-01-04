'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Grid,
  List,
  FileText,
  Database,
  Presentation,
  Image,
  Video,
  Music,
  Code,
  Link as LinkIcon,
  Eye,
  Trash2,
  Building2,
  User,
  Globe,
} from 'lucide-react'
import { DATA_TYPES } from '@/lib/constants'
import { DataType, StoredFile, FileArea } from '@/types'
import { useLocalFiles } from '@/hooks/use-local-files'
import { useAuth } from '@/hooks/use-auth'

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

const getDataTypeName = (type: DataType) => {
  return DATA_TYPES.find(dt => dt.id === type)?.name || type
}

export function DataManagement() {
  const { files, removeFile, updateStatus, hydrated } = useLocalFiles()
  const { currentUser, departments, getDepartment } = useAuth()
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedType, setSelectedType] = useState<DataType | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedArea, setSelectedArea] = useState<FileArea | 'all'>('all')
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null)

  // Get user's department
  const userDepartment = currentUser?.departmentId ? getDepartment(currentUser.departmentId) : null

  // Check permissions
  const canDeleteGeneral = currentUser?.role === 'admin'
  const canDeleteDepartment = (deptName: string) => {
    if (currentUser?.role === 'admin') return true
    if (currentUser?.role === 'leader' && userDepartment?.name === deptName) return true
    return false
  }
  const canDeletePersonal = (ownerId: string) => currentUser?.id === ownerId

  const departmentOptions = departments.map(d => d.name)

  // Filter files based on user's access
  const accessibleFiles = useMemo(() => {
    return files.filter(file => {
      // General files: everyone can see approved files or their own pending
      if (file.area === 'general') {
        return file.status === 'approved' || file.ownerId === currentUser?.id || currentUser?.role === 'admin'
      }
      // Department files: department members can see, or admin
      if (file.area === 'department') {
        if (currentUser?.role === 'admin') return true
        if (userDepartment?.name === file.departmentName) return true
        return file.ownerId === currentUser?.id
      }
      // Personal files: only owner
      if (file.area === 'personal') {
        return file.ownerId === currentUser?.id
      }
      return false
    })
  }, [files, currentUser, userDepartment])

  const filteredFiles: StoredFile[] = accessibleFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || file.type === selectedType
    const matchesDepartment = selectedDepartment === 'all' || file.departmentName === selectedDepartment
    const matchesArea = selectedArea === 'all' || file.area === selectedArea
    return matchesSearch && matchesType && matchesDepartment && matchesArea
  })

  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setSearchQuery(q)
  }, [searchParams])

  if (!hydrated) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Veri Yönetimi</h1>
        <p className="text-gray-600">Genel, departman ve kişisel verilerinizi yönetin</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Dosya ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DataType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Tipler</option>
                {DATA_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Departmanlar</option>
                {departmentOptions.map((dept: string) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as FileArea | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Alanlar</option>
                <option value="general">Genel</option>
                <option value="department">Departman</option>
                <option value="personal">Kişisel</option>
              </select>

              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => {
            const Icon = getDataTypeIcon(file.type)
            // Permission checks
            const canDelete = 
              (file.area === 'personal' && canDeletePersonal(file.ownerId)) ||
              (file.area === 'general' && canDeleteGeneral) ||
              (file.area === 'department' && canDeleteDepartment(file.departmentName || ''))
            
            const showApproveActions =
              currentUser?.role === 'admin' &&
              file.status === 'pending' &&
              file.area !== 'personal'

            // Area info
            const areaLabel = file.area === 'general' ? 'Genel Alan' : 
                              file.area === 'department' ? file.departmentName : 
                              'Kişisel'
            const AreaIcon = file.area === 'general' ? Globe : 
                             file.area === 'department' ? Building2 : User
            const areaColor = file.area === 'general' ? 'text-blue-600 bg-blue-50' : 
                              file.area === 'department' ? 'text-green-600 bg-green-50' : 
                              'text-purple-600 bg-purple-50'

            return (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${areaColor}`}>
                      <AreaIcon className="h-3 w-3" />
                      {areaLabel}
                    </span>
                  </div>

                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{file.name}</h3>

                  <div className="space-y-1 text-xs text-gray-600">
                    <p>{getDataTypeName(file.type)}</p>
                    <p>{file.sizeLabel}</p>
                    <p className="text-gray-400">Yükleyen: {file.ownerName}</p>
                    <p className={
                      file.status === 'approved' ? 'text-green-600' :
                      file.status === 'pending' ? 'text-yellow-700' :
                      'text-red-600'
                    }>
                      {file.status === 'approved' ? 'Onaylı' : file.status === 'pending' ? 'Onay bekliyor' : 'Reddedildi'}
                    </p>
                    {file.submitNote && <p className="text-[10px] text-gray-500">Not: {file.submitNote}</p>}
                  </div>

                  <div className="flex gap-1 mt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewFile(file)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Gör
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!canDelete}
                      onClick={async () => canDelete && await removeFile(file.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Sil
                    </Button>
                  </div>
                  {showApproveActions && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => updateStatus(file.id, 'approved', 'Admin onayı')}>
                        Onayla
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(file.id, 'rejected', 'Admin reddi')}>
                        Reddet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredFiles.map((file) => {
                const Icon = getDataTypeIcon(file.type)
                // Permission checks
                const canDelete = 
                  (file.area === 'personal' && canDeletePersonal(file.ownerId)) ||
                  (file.area === 'general' && canDeleteGeneral) ||
                  (file.area === 'department' && canDeleteDepartment(file.departmentName || ''))
                
                const showApproveActions =
                  currentUser?.role === 'admin' &&
                  file.status === 'pending' &&
                  file.area !== 'personal'

                // Area info
                const areaLabel = file.area === 'general' ? 'Genel' : 
                                  file.area === 'department' ? file.departmentName : 
                                  'Kişisel'
                const AreaIcon = file.area === 'general' ? Globe : 
                                 file.area === 'department' ? Building2 : User
                const areaColor = file.area === 'general' ? 'text-blue-600 bg-blue-50' : 
                                  file.area === 'department' ? 'text-green-600 bg-green-50' : 
                                  'text-purple-600 bg-purple-50'

                return (
                  <div key={file.id} className="p-4 flex items-center gap-4">
                    <Icon className="h-8 w-8 text-blue-600" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${areaColor}`}>
                          <AreaIcon className="h-3 w-3" />
                          {areaLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getDataTypeName(file.type)} • {file.sizeLabel} • {file.ownerName}
                      </p>
                      <p className={
                        file.status === 'approved' ? 'text-green-600 text-xs' :
                        file.status === 'pending' ? 'text-yellow-700 text-xs' :
                        'text-red-600 text-xs'
                      }>
                        {file.status === 'approved' ? 'Onaylı' : file.status === 'pending' ? 'Onay bekliyor' : 'Reddedildi'}
                      </p>
                    </div>

                    <div className="text-sm text-gray-600 hidden md:block">
                      {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewFile(file)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!canDelete}
                        onClick={async () => canDelete && await removeFile(file.id)}
                        className={!canDelete ? 'opacity-40 cursor-not-allowed' : ''}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {showApproveActions && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(file.id, 'approved', 'Admin onayı')}>
                            Onayla
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(file.id, 'rejected', 'Admin reddi')}>
                            Reddet
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dosya Bulunamadı</h3>
            <p className="text-gray-600">
              Arama kriterlerinize uygun dosya bulunamadı.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{previewFile.name}</CardTitle>
                <CardDescription>
                  {previewFile.departmentName || 'Genel'} • {previewFile.sizeLabel} • {previewFile.status === 'pending' ? 'Onay bekliyor' : previewFile.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                Kapat
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewFile.previewUrl ? (
                previewFile.mimeType?.startsWith('image/') ? (
                  <div className="w-full flex justify-center">
                    <img src={previewFile.previewUrl} alt={previewFile.name} className="max-h-[70vh] rounded border" />
                  </div>
                ) : previewFile.mimeType?.startsWith('video/') ? (
                  <video controls className="w-full max-h-[70vh] rounded border" src={previewFile.previewUrl} />
                ) : previewFile.mimeType?.startsWith('audio/') ? (
                  <div className="p-4 border rounded">
                    <audio controls className="w-full" src={previewFile.previewUrl} />
                  </div>
                ) : previewFile.mimeType === 'application/pdf' || previewFile.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-[70vh] border rounded overflow-hidden bg-gray-100">
                    <object
                      data={previewFile.previewUrl}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <iframe
                        src={previewFile.previewUrl}
                        className="w-full h-full"
                        title={previewFile.name}
                      >
                        <p className="p-4 text-center">
                          Tarayıcınız PDF önizlemeyi desteklemiyor.{' '}
                          <a href={previewFile.previewUrl} download={previewFile.name} className="text-blue-600 underline">
                            PDF&apos;i indirin
                          </a>
                        </p>
                      </iframe>
                    </object>
                  </div>
                ) : (
                  <div className="w-full h-[70vh] border rounded overflow-hidden">
                    <iframe src={previewFile.previewUrl} className="w-full h-full" title={previewFile.name} />
                  </div>
                )
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Önizleme Kullanılamıyor</h4>
                  <p className="text-gray-500 mb-4">
                    Bu dosya sistem tarafından oluşturulmuş örnek bir dosyadır veya dosya verisi kaybolmuştur.
                  </p>
                  <p className="text-sm text-gray-400">
                    Gerçek dosyaları yükleyerek önizleme özelliğini kullanabilirsiniz.
                  </p>
                </div>
              )}
              {previewFile.submitNote && (
                <p className="text-sm text-gray-700">
                  <strong>Ekleyen notu:</strong> {previewFile.submitNote}
                </p>
              )}
              {previewFile.reviewNote && (
                <p className="text-sm text-gray-700">
                  <strong>Yönetici notu:</strong> {previewFile.reviewNote}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
