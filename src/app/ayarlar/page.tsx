'use client'

import { useState } from 'react'
import { Navigation } from '@/components/layout/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useLocalFiles } from '@/hooks/use-local-files'
import { StoredFile } from '@/types'
import {
  Building2,
  Users,
  FileCheck,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  Check,
  XCircle,
  Copy,
  RefreshCw,
  Shield,
  User,
  Crown
} from 'lucide-react'

// Generate random password
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Generate username from full name
function generateUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 20)
}

export default function AyarlarPage() {
  const { 
    currentUser, 
    departments, 
    users, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment,
    addUser,
    updateUser,
    deleteUser,
    getDepartment
  } = useAuth()
  
  const { files, updateStatus } = useLocalFiles()

  // Department state
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDesc, setNewDeptDesc] = useState('')
  const [editingDept, setEditingDept] = useState<string | null>(null)
  const [editDeptName, setEditDeptName] = useState('')
  const [editDeptDesc, setEditDeptDesc] = useState('')

  // User state
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserDept, setNewUserDept] = useState('')
  const [newUserRole, setNewUserRole] = useState<'employee' | 'leader'>('employee')
  const [generatedUsername, setGeneratedUsername] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editUserData, setEditUserData] = useState({ fullName: '', email: '', role: 'employee' as 'employee' | 'leader', departmentId: '', password: '' })

  // Preview file state
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null)

  // Only admin can access
  if (currentUser?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Erişim Reddedildi</h1>
            <p className="text-gray-600">Bu sayfaya sadece yöneticiler erişebilir.</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Get pending files
  const pendingFiles = files.filter(f => f.status === 'pending' && !f.isPersonal)

  // Handle add department
  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return
    addDepartment(newDeptName.trim(), newDeptDesc.trim() || undefined)
    setNewDeptName('')
    setNewDeptDesc('')
  }

  // Handle edit department
  const handleEditDepartment = (id: string) => {
    const dept = departments.find(d => d.id === id)
    if (dept) {
      setEditingDept(id)
      setEditDeptName(dept.name)
      setEditDeptDesc(dept.description || '')
    }
  }

  // Handle save department edit
  const handleSaveDepartment = () => {
    if (editingDept && editDeptName.trim()) {
      updateDepartment(editingDept, { name: editDeptName.trim(), description: editDeptDesc.trim() || undefined })
      setEditingDept(null)
    }
  }

  // Handle delete department
  const handleDeleteDepartment = (id: string) => {
    if (confirm('Bu departmanı silmek istediğinize emin misiniz? Departmandaki kullanıcılar departmansız kalacak.')) {
      deleteDepartment(id)
    }
  }

  // Handle generate user credentials
  const handleGenerateCredentials = () => {
    if (newUserName.trim()) {
      setGeneratedUsername(generateUsername(newUserName))
      setGeneratedPassword(generatePassword())
    }
  }

  // Handle add user
  const handleAddUser = () => {
    if (!newUserName.trim() || !generatedUsername || !generatedPassword) return
    
    addUser({
      username: generatedUsername,
      password: generatedPassword,
      email: newUserEmail,
      fullName: newUserName.trim(),
      role: newUserRole,
      departmentId: newUserDept || undefined,
      isActive: true
    })
    
    // Reset form
    setShowAddUser(false)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserDept('')
    setNewUserRole('employee')
    setGeneratedUsername('')
    setGeneratedPassword('')
  }

  // Handle edit user
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setEditingUser(userId)
      setEditUserData({
        fullName: user.fullName,
        email: user.email,
        role: user.role === 'admin' ? 'employee' : user.role,
        departmentId: user.departmentId || '',
        password: ''
      })
    }
  }

  // Handle save user edit
  const handleSaveUser = () => {
    if (editingUser) {
      const updates: Record<string, any> = {
        fullName: editUserData.fullName,
        email: editUserData.email,
        role: editUserData.role,
        departmentId: editUserData.departmentId || undefined
      }
      if (editUserData.password) {
        updates.password = editUserData.password
      }
      updateUser(editingUser, updates)
      setEditingUser(null)
    }
  }

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Kendi hesabınızı silemezsiniz!')
      return
    }
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      deleteUser(userId)
    }
  }

  // Handle approve file
  const handleApproveFile = (fileId: string) => {
    updateStatus(fileId, 'approved')
  }

  // Handle reject file
  const handleRejectFile = (fileId: string) => {
    const reason = prompt('Red nedeni (opsiyonel):')
    updateStatus(fileId, 'rejected', reason || undefined)
  }

  const roleLabels = {
    admin: 'Yönetici',
    leader: 'Departman Lideri',
    employee: 'Çalışan'
  }

  const roleIcons = {
    admin: Shield,
    leader: Crown,
    employee: User
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
            <p className="text-gray-600">Departman, kullanıcı ve dosya yönetimi</p>
          </div>

          <Tabs defaultValue="departments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departmanlar
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kullanıcılar
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Dosya Onayları
                {pendingFiles.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {pendingFiles.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Departments Tab */}
            <TabsContent value="departments" className="space-y-4">
              {/* Add Department */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yeni Departman Ekle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Departman adı"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Açıklama (opsiyonel)"
                      value={newDeptDesc}
                      onChange={(e) => setNewDeptDesc(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddDepartment} disabled={!newDeptName.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Department List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mevcut Departmanlar ({departments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {departments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Henüz departman eklenmemiş.</p>
                  ) : (
                    <div className="space-y-3">
                      {departments.map(dept => {
                        const deptUsers = users.filter(u => u.departmentId === dept.id)
                        const leader = users.find(u => u.departmentId === dept.id && u.role === 'leader')
                        
                        return (
                          <div key={dept.id} className="p-4 border rounded-lg bg-white">
                            {editingDept === dept.id ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                  value={editDeptName}
                                  onChange={(e) => setEditDeptName(e.target.value)}
                                  placeholder="Departman adı"
                                  className="flex-1"
                                />
                                <Input
                                  value={editDeptDesc}
                                  onChange={(e) => setEditDeptDesc(e.target.value)}
                                  placeholder="Açıklama"
                                  className="flex-1"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleSaveDepartment}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingDept(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium">{dept.name}</h3>
                                  {dept.description && (
                                    <p className="text-sm text-gray-500">{dept.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>{deptUsers.length} kullanıcı</span>
                                    {leader && (
                                      <span className="flex items-center gap-1">
                                        <Crown className="h-3 w-3 text-yellow-500" />
                                        Lider: {leader.fullName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditDepartment(dept.id)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteDepartment(dept.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              {/* Add User */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Yeni Kullanıcı Ekle</span>
                    {!showAddUser && (
                      <Button size="sm" onClick={() => setShowAddUser(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Kullanıcı Ekle
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                {showAddUser && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                        <Input
                          placeholder="Örn: Ahmet Yılmaz"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">E-posta</label>
                        <Input
                          type="email"
                          placeholder="ornek@sirket.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Departman</label>
                        <select
                          value={newUserDept}
                          onChange={(e) => setNewUserDept(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="">Departman seçin</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Rol</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as 'employee' | 'leader')}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="employee">Çalışan</option>
                          <option value="leader">Departman Lideri</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">Giriş Bilgileri</label>
                        <Button size="sm" variant="outline" onClick={handleGenerateCredentials} disabled={!newUserName.trim()}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Otomatik Oluştur
                        </Button>
                      </div>
                      
                      {generatedUsername && generatedPassword && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Kullanıcı Adı</label>
                            <div className="flex items-center gap-2">
                              <Input value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} />
                              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(generatedUsername)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Şifre</label>
                            <div className="flex items-center gap-2">
                              <Input value={generatedPassword} onChange={(e) => setGeneratedPassword(e.target.value)} />
                              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(generatedPassword)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs text-green-700">
                              Bu bilgileri kullanıcıya iletmeyi unutmayın!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => {
                        setShowAddUser(false)
                        setNewUserName('')
                        setNewUserEmail('')
                        setNewUserDept('')
                        setGeneratedUsername('')
                        setGeneratedPassword('')
                      }}>
                        İptal
                      </Button>
                      <Button onClick={handleAddUser} disabled={!newUserName.trim() || !generatedUsername || !generatedPassword}>
                        Kullanıcı Ekle
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* User List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mevcut Kullanıcılar ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map(user => {
                      const RoleIcon = roleIcons[user.role]
                      const userDept = user.departmentId ? getDepartment(user.departmentId) : null
                      const isEditing = editingUser === user.id
                      
                      return (
                        <div key={user.id} className="p-4 border rounded-lg bg-white">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  placeholder="Ad Soyad"
                                  value={editUserData.fullName}
                                  onChange={(e) => setEditUserData(prev => ({ ...prev, fullName: e.target.value }))}
                                />
                                <Input
                                  placeholder="E-posta"
                                  value={editUserData.email}
                                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <select
                                  value={editUserData.departmentId}
                                  onChange={(e) => setEditUserData(prev => ({ ...prev, departmentId: e.target.value }))}
                                  className="px-3 py-2 border rounded-md text-sm"
                                  disabled={user.role === 'admin'}
                                >
                                  <option value="">Departman yok</option>
                                  {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                                <select
                                  value={editUserData.role}
                                  onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value as 'employee' | 'leader' }))}
                                  className="px-3 py-2 border rounded-md text-sm"
                                  disabled={user.role === 'admin'}
                                >
                                  <option value="employee">Çalışan</option>
                                  <option value="leader">Departman Lideri</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Yeni Şifre (boş bırakırsanız değişmez)</label>
                                <Input
                                  type="text"
                                  placeholder="Yeni şifre"
                                  value={editUserData.password}
                                  onChange={(e) => setEditUserData(prev => ({ ...prev, password: e.target.value }))}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                                  İptal
                                </Button>
                                <Button size="sm" onClick={handleSaveUser}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Kaydet
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {user.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{user.fullName}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                      user.role === 'leader' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      <RoleIcon className="h-3 w-3" />
                                      {roleLabels[user.role]}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">@{user.username}</p>
                                  {userDept && (
                                    <p className="text-xs text-gray-400">{userDept.name}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditUser(user.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user.role !== 'admin' && (
                                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* File Approvals Tab */}
            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Bekleyen Dosya Onayları
                    {pendingFiles.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({pendingFiles.length} dosya)
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Genel alan ve departman dosyaları için onay/red işlemleri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <Check className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-500">Bekleyen dosya yok!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingFiles.map(file => (
                        <div key={file.id} className="p-4 border rounded-lg bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Gönderen kişi - En üstte belirgin */}
                              <div className="flex items-center gap-3 mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {file.ownerName?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-medium text-yellow-800">{file.ownerName || 'Bilinmeyen'}</p>
                                  <p className="text-xs text-yellow-600">
                                    {new Date(file.uploadedAt).toLocaleDateString('tr-TR')} - {new Date(file.uploadedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{file.name}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  file.area === 'general' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {file.area === 'general' ? 'Genel Alan' : file.departmentName || 'Departman'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                <div>
                                  <span className="text-gray-400">Boyut:</span> {file.sizeLabel}
                                </div>
                                <div>
                                  <span className="text-gray-400">Tür:</span> {file.type}
                                </div>
                              </div>
                              
                              {file.submitNote && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <span className="text-gray-400">Not:</span> {file.submitNote}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button size="sm" variant="outline" onClick={() => setPreviewFile(file)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Gör
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveFile(file.id)}>
                                <Check className="h-4 w-4 mr-1" />
                                Onayla
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectFile(file.id)}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reddet
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Son İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {files
                      .filter(f => f.status !== 'pending' && !f.isPersonal)
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .slice(0, 10)
                      .map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${
                              file.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{file.ownerName}</span>
                            <span className={`px-2 py-0.5 rounded ${
                              file.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {file.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                            </span>
                          </div>
                        </div>
                      ))}
                    {files.filter(f => f.status !== 'pending' && !f.isPersonal).length === 0 && (
                      <p className="text-gray-500 text-center py-4">Henüz işlem yapılmamış.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{previewFile.name}</CardTitle>
                  <CardDescription>
                    {previewFile.sizeLabel} • {previewFile.ownerName} tarafından yüklendi
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {previewFile.previewUrl ? (
                previewFile.mimeType?.startsWith('image/') ? (
                  <img src={previewFile.previewUrl} alt={previewFile.name} className="max-h-96 mx-auto rounded" />
                ) : (
                  <iframe src={previewFile.previewUrl} className="w-full h-96 border rounded" />
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bu dosya için önizleme kullanılamıyor.</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" onClick={() => setPreviewFile(null)}>Kapat</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                  handleApproveFile(previewFile.id)
                  setPreviewFile(null)
                }}>
                  <Check className="h-4 w-4 mr-2" />
                  Onayla
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleRejectFile(previewFile.id)
                  setPreviewFile(null)
                }}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  )
}

