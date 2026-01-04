'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Check } from 'lucide-react'
import { DEFAULT_DEPARTMENTS } from '@/lib/constants'
import { Department } from '@/types'

interface DepartmentStepProps {
  selectedDepartments: Department[]
  onDepartmentsChange: (departments: Department[]) => void
  onNext: () => void
}

export function DepartmentStep({ selectedDepartments, onDepartmentsChange, onNext }: DepartmentStepProps) {
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('')

  const toggleDepartment = (department: { name: string; description: string }) => {
    const exists = selectedDepartments.find(d => d.name === department.name)
    if (exists) {
      onDepartmentsChange(selectedDepartments.filter(d => d.name !== department.name))
    } else {
      const newDept: Department = {
        id: Date.now().toString(),
        name: department.name,
        description: department.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      onDepartmentsChange([...selectedDepartments, newDept])
    }
  }

  const addNewDepartment = () => {
    if (!newDepartmentName.trim()) return

    const newDept: Department = {
      id: Date.now().toString(),
      name: newDepartmentName.trim(),
      description: newDepartmentDescription.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onDepartmentsChange([...selectedDepartments, newDept])
    setNewDepartmentName('')
    setNewDepartmentDescription('')
  }

  const isSelected = (name: string) => selectedDepartments.some(d => d.name === name)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Departmanları Seçin</h2>
        <p className="text-gray-600 mt-2">
          Şirketinizde kullanmak istediğiniz departmanları seçin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_DEPARTMENTS.map((dept) => (
          <Card
            key={dept.name}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected(dept.name)
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleDepartment(dept)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                {isSelected(dept.name) && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{dept.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Departman Ekle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Departman adı"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
          />
          <Input
            placeholder="Açıklama (opsiyonel)"
            value={newDepartmentDescription}
            onChange={(e) => setNewDepartmentDescription(e.target.value)}
          />
          <Button
            onClick={addNewDepartment}
            disabled={!newDepartmentName.trim()}
            className="w-full"
          >
            Departman Ekle
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={selectedDepartments.length === 0}
          size="lg"
        >
          Devam Et
        </Button>
      </div>
    </div>
  )
}
