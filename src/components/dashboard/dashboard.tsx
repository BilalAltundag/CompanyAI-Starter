'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Database,
  Users,
  MessageSquare,
  Upload,
  FileText,
  Eye,
  ChevronRight,
  User,
  Trash2,
  Link as LinkIcon
} from 'lucide-react'
import { PersonalDataManager } from './personal-data-manager'
import { useLocalFiles } from '@/hooks/use-local-files'
import { useAuth } from '@/hooks/use-auth'
import { StoredFile } from '@/types'
import { DATA_TYPES } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function Dashboard() {
  const { generalFiles, departmentFiles, personalFiles, addFiles, removeFile, updateStatus, hydrated } = useLocalFiles()
  const { currentUser, departments, users, settings, getDepartment } = useAuth()
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null)
  const [uploadModal, setUploadModal] = useState<{ open: boolean; area: 'general' | 'department'; departmentName?: string }>({
    open: false,
    area: 'general'
  })
  const [uploadNote, setUploadNote] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user's department
  const userDepartment = currentUser?.departmentId ? getDepartment(currentUser.departmentId) : null

  // Filter files based on user's access
  const myPersonalFiles = personalFiles.filter(f => f.ownerId === currentUser?.id)
  const myDepartmentFiles = currentUser?.role === 'admin' 
    ? departmentFiles 
    : departmentFiles.filter(f => f.departmentName === userDepartment?.name || f.ownerId === currentUser?.id)
  const visibleGeneralFiles = currentUser?.role === 'admin'
    ? generalFiles
    : generalFiles.filter(f => f.status === 'approved' || f.ownerId === currentUser?.id)

  const stats = {
    totalFiles: visibleGeneralFiles.length + myDepartmentFiles.length + myPersonalFiles.length,
    totalUsers: users.length,
    activeChatbots: departments.length,
    departments: departments.length,
    myPersonalFiles: myPersonalFiles.length,
    pendingApprovals: currentUser?.role === 'admin' ? generalFiles.filter(f => f.status === 'pending').length : 0
  }

  // Dashboard içinde hızlı yükleme için handler
  const handleQuickUpload = (files: File[], area: 'general' | 'department' | 'personal') => {
    const autoApprove = area === 'personal' // kişisel otomatik onay
    addFiles(files, area, {
      departmentName: area === 'department' ? departments[0]?.name : undefined,
      uploadedBy: currentUser?.fullName || 'Bilinmiyor',
      ownerId: currentUser?.id || 'unknown',
      ownerName: currentUser?.fullName || 'Bilinmiyor',
      autoApprove,
      submitNote: area === 'personal' ? undefined : 'Dashboard hızlı yükleme'
    })
  }

  const departmentOptions = departments.map((d) => d.name)

  // Hydration guard to avoid text mismatch
  if (!hydrated) return null

  const submitUploadRequest = () => {
    if (pendingFiles.length === 0) return
    addFiles(pendingFiles, uploadModal.area, {
      departmentName: uploadModal.area === 'department' ? (uploadModal.departmentName || departmentOptions[0]) : undefined,
      uploadedBy: currentUser?.fullName || 'Bilinmiyor',
      ownerId: currentUser?.id || 'unknown',
      ownerName: currentUser?.fullName || 'Bilinmiyor',
      autoApprove: false,
      submitNote: uploadNote || undefined,
    })
    setPendingFiles([])
    setUploadNote('')
    setUploadModal({ open: false, area: 'general' })
  }

  // Check if current user can approve/reject files
  const canApproveGeneral = currentUser?.role === 'admin'
  const canApproveDepartment = (deptName: string) => {
    if (currentUser?.role === 'admin') return true
    if (currentUser?.role === 'leader' && currentUser.departmentId) {
      const userDept = departments.find(d => d.id === currentUser.departmentId)
      return userDept?.name === deptName
    }
    return false
  }

  const dataAreas = [
    {
      id: 'general',
      title: 'Genel Alan',
      description: 'Tüm departmanlar ve kullanıcılar tarafından erişilebilir',
      icon: Database,
      count: visibleGeneralFiles.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      files: visibleGeneralFiles
    },
    {
      id: 'department',
      title: userDepartment ? userDepartment.name : 'Departman Alanları',
      description: userDepartment 
        ? `${userDepartment.name} departmanının verileri` 
        : 'Departman üyelerinin erişebileceği veriler',
      icon: Users,
      count: myDepartmentFiles.length,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      files: myDepartmentFiles
    },
    {
      id: 'personal',
      title: 'Kişisel Alanım',
      description: 'Sadece sizin erişebileceğiniz özel veriler',
      icon: User,
      count: myPersonalFiles.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      files: myPersonalFiles
    }
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="data">Veri Yönetimi</TabsTrigger>
          <TabsTrigger value="personal">Kişisel Veri</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              {settings?.companyName || 'Company AI'}&apos;ya Hoş Geldiniz{currentUser?.fullName ? `, ${currentUser.fullName}` : ''}!
            </h1>
            <p className="text-blue-100">
              {departments.length} departman ve {users.length} kullanıcı ile
              sisteminiz hazır. Verilerinize akıllı erişim sağlayın.
            </p>
            {settings?.setupCompletedAt && (
              <p className="text-xs text-blue-200 mt-3">
                Kurulum tamamlandı: {new Date(settings.setupCompletedAt).toLocaleDateString('tr-TR')}
              </p>
            )}
          </div>

          {/* Stats Cards - Role-based */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {currentUser?.role === 'admin' ? 'Toplam Dosya' : 'Erişilebilir Dosya'}
                    </p>
                    <p className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {currentUser?.role === 'admin' ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Kullanıcı Sayısı</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Kişisel Dosyalarım</p>
                      <p className="text-2xl font-bold">{stats.myPersonalFiles}</p>
                    </div>
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {userDepartment ? 'Departmanım' : 'Departman Sayısı'}
                    </p>
                    <p className="text-2xl font-bold">
                      {userDepartment ? userDepartment.name : stats.departments}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {currentUser?.role === 'admin' ? (
              <Card className={stats.pendingApprovals > 0 ? 'border-orange-300 bg-orange-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bekleyen Onay</p>
                      <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Chatbot</p>
                      <p className="text-2xl font-bold">{stats.activeChatbots}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Data Areas Overview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Veri Alanları</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dataAreas.map((area) => {
                const Icon = area.icon
                return (
                  <Card key={area.id} className={`hover:shadow-md transition-shadow ${area.bgColor} ${area.borderColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Icon className={`h-6 w-6 ${area.color}`} />
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <CardTitle className="text-lg">{area.title}</CardTitle>
                      <CardDescription>{area.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{area.count}</p>
                      <p className="text-sm text-gray-600">dosya</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {/* Full Data Management Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {dataAreas.map((area) => {
              const Icon = area.icon
              return (
                <Card key={area.id} className={`${area.bgColor} ${area.borderColor}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${area.color}`} />
                      {area.title}
                    </CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {area.files.map((file, index) => {
                        const canDelete = file.isPersonal && file.ownerId === currentUser?.id
                        const showApproveActions =
                          file.status === 'pending' &&
                          area.id !== 'personal' &&
                          (area.id === 'general' ? canApproveGeneral : canApproveDepartment(file.departmentName || ''))
                        return (
                        <div key={index} className={`p-2 bg-white rounded border space-y-2 ${file.status === 'pending' ? 'border-yellow-300' : ''}`}>
                          {/* Bekleyen dosyalarda gönderen belirgin */}
                          {file.status === 'pending' && (
                            <div className="flex items-center gap-2 p-1.5 bg-yellow-50 rounded text-xs">
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {file.ownerName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-yellow-800">{file.ownerName || 'Bilinmeyen'}</span>
                                <span className="text-yellow-600 ml-1">tarafından gönderildi</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className={`text-[10px] px-2 py-1 rounded whitespace-nowrap ${
                                file.status === 'approved' ? 'bg-green-100 text-green-700' :
                                file.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {file.status === 'approved' ? 'Onaylı' : file.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                              </span>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewFile(file)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              {!file.isPersonal && (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <LinkIcon className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ${!canDelete ? 'opacity-40 cursor-not-allowed' : ''}`}
                                disabled={!canDelete}
                                onClick={() => canDelete && removeFile(file.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {/* Onaylı dosyalarda yükleyen küçük göster */}
                          {file.status !== 'pending' && file.ownerName && (
                            <p className="text-[10px] text-gray-400">Yükleyen: {file.ownerName}</p>
                          )}
                          {showApproveActions && (
                            <div className="flex gap-2 pt-1 border-t">
                              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => updateStatus(file.id, 'approved', 'Admin onayı')}>
                                Onayla
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => updateStatus(file.id, 'rejected', 'Admin reddi')}>
                                Reddet
                              </Button>
                            </div>
                          )}
                        </div>
                        )
                      })}
                      
                      {/* Upload Button for each area */}
                      {area.id !== 'personal' && (
                        <Button
                          size="sm"
                          className="w-full mt-3"
                          variant="outline"
                          onClick={() => setUploadModal({ open: true, area: area.id as 'general' | 'department', departmentName: departmentOptions[0] })}
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Dosya Yükleme İsteği
                        </Button>
                      )}
                      
                      {area.id === 'general' && (
                        <p className="text-xs text-blue-600 mt-2">
                          Bu genel dosyalar tüm departman ve kullanıcılara otomatik olarak erişilebilir.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="personal">
          <PersonalDataManager
            personalFiles={myPersonalFiles}
            onAddFiles={(files) => handleQuickUpload(files, 'personal')}
            onRemoveFile={(id) => removeFile(id)}
          />
        </TabsContent>
      </Tabs>

      {/* Upload Request Modal */}
      {uploadModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Dosya Yükleme İsteği</CardTitle>
              <CardDescription>
                {uploadModal.area === 'general'
                  ? 'Genel alana yükleme isteği — genel admin onayı gerekir.'
                  : 'Departman alanına yükleme isteği — ilgili departman yöneticisi onayı gerekir.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium mb-1">Hedef Alan</p>
                  <div className="text-sm text-gray-700">
                    {uploadModal.area === 'general' ? 'Genel Alan' : 'Departman Alanı'}
                  </div>
                </div>
                {uploadModal.area === 'department' && (
                  <div>
                    <p className="text-sm font-medium mb-1">Departman</p>
                    <select
                      value={uploadModal.departmentName}
                      onChange={(e) => setUploadModal((prev) => ({ ...prev, departmentName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      {departmentOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Yöneticiye Not (opsiyonel)</p>
                <Textarea
                  placeholder="Yükleme gerekçesini yazın..."
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  className="min-h-[90px]"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Dosya Seç</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setPendingFiles(files)
                  }}
                  accept={DATA_TYPES.flatMap(dt => dt.extensions).join(',')}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Dosya Seç ({pendingFiles.length})
                </Button>
                {pendingFiles.length > 0 && (
                  <p className="text-xs text-gray-600">
                    {pendingFiles.length} dosya seçildi
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setUploadModal({ open: false, area: 'general' }); setPendingFiles([]); setUploadNote('') }}>
                  İptal
                </Button>
                <Button onClick={submitUploadRequest} disabled={pendingFiles.length === 0}>
                  Gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
                ) : (
                  <div className="w-full h-[70vh] border rounded overflow-hidden">
                    <iframe src={previewFile.previewUrl} className="w-full h-full" title={previewFile.name} />
                  </div>
                )
              ) : (
                <div className="p-6 text-center text-gray-600">
                  Bu dosya için önizleme desteklenmiyor (yeniden yükleyerek önizleme oluşturulabilir).
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
