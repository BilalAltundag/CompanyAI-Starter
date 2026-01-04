'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Users } from 'lucide-react'
import { Department, User } from '@/types'

interface UserStepProps {
  departments: Department[]
  users: User[]
  onUsersChange: (users: User[]) => void
  onNext: () => void
  onBack: () => void
}

export function UserStep({ departments, users, onUsersChange, onNext, onBack }: UserStepProps) {
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    department_ids: [] as string[]
  })

  const addUser = () => {
    if (!newUser.email.trim() || !newUser.full_name.trim()) return

    const user: User = {
      id: Date.now().toString(),
      email: newUser.email.trim(),
      full_name: newUser.full_name.trim(),
      department_ids: newUser.department_ids,
      role: newUser.department_ids.includes('admin') ? 'admin' : 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onUsersChange([...users, user])
    setNewUser({ email: '', full_name: '', department_ids: [] })
  }

  const removeUser = (userId: string) => {
    onUsersChange(users.filter(u => u.id !== userId))
  }

  const toggleUserDepartment = (userId: string, departmentId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const departmentIds = user.department_ids.includes(departmentId)
          ? user.department_ids.filter(id => id !== departmentId)
          : [...user.department_ids, departmentId]

        return {
          ...user,
          department_ids: departmentIds,
          role: departmentIds.includes('admin') ? 'admin' : 'user'
        }
      }
      return user
    })
    onUsersChange(updatedUsers)
  }

  const getDepartmentName = (id: string) => {
    const dept = departments.find(d => d.id === id)
    return dept?.name || 'Bilinmeyen'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Kullanıcıları Ekle</h2>
        <p className="text-gray-600 mt-2">
          Departmanlara kullanıcıları atayın
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Yeni Kullanıcı Ekle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Ad Soyad"
              value={newUser.full_name}
              onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="E-posta"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Departmanlar:</p>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Button
                  key={dept.id}
                  variant={newUser.department_ids.includes(dept.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const ids = newUser.department_ids.includes(dept.id)
                      ? newUser.department_ids.filter(id => id !== dept.id)
                      : [...newUser.department_ids, dept.id]
                    setNewUser(prev => ({ ...prev, department_ids: ids }))
                  }}
                >
                  {dept.name}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={addUser}
            disabled={!newUser.email.trim() || !newUser.full_name.trim() || newUser.department_ids.length === 0}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Kullanıcı Ekle
          </Button>
        </CardContent>
      </Card>

      {users.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Eklenen Kullanıcılar</h3>
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{user.full_name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.department_ids.map(deptId => (
                        <span key={deptId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {getDepartmentName(deptId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Geri
        </Button>
        <Button onClick={onNext} disabled={users.length === 0}>
          Devam Et
        </Button>
      </div>
    </div>
  )
}
