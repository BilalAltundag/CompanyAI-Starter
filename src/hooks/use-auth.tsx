'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { User, Department, CompanySettings, Session, SetupFormData } from '@/types/auth'

// Storage keys
const STORAGE_KEYS = {
  USERS: 'company-ai-users',
  DEPARTMENTS: 'company-ai-departments',
  SETTINGS: 'company-ai-settings',
  SESSION: 'company-ai-session',
}

// Simple hash function for demo (in production use bcrypt)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36) + str.length.toString(36)
}

// Generate UUID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Load from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// Save to localStorage
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Saved to localStorage: ${key}`, value ? 'with data' : 'empty')
    }
  } catch (error) {
    console.error(`❌ Failed to save to localStorage: ${key}`, error)
  }
}

// Auth Store Hook
export function useAuthStore() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadedUsers = loadFromStorage(STORAGE_KEYS.USERS, [])
    const loadedDepartments = loadFromStorage(STORAGE_KEYS.DEPARTMENTS, [])
    const loadedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, null)
    const loadedSession = loadFromStorage(STORAGE_KEYS.SESSION, null)
    
    // Debug logs (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Loading from localStorage:')
      console.log('  Users:', loadedUsers.length)
      console.log('  Departments:', loadedDepartments.length)
      console.log('  Settings:', loadedSettings ? 'Found' : 'Not found')
      console.log('  Session:', loadedSession ? 'Found' : 'Not found')
      if (loadedSettings && typeof loadedSettings === 'object' && 'setupCompleted' in loadedSettings) {
        console.log('  Setup completed:', (loadedSettings as CompanySettings).setupCompleted ?? false)
      }
    }
    
    setUsers(loadedUsers)
    setDepartments(loadedDepartments)
    setSettings(loadedSettings)
    setSession(loadedSession)
    setHydrated(true)
  }, [])

  // Save users when changed
  useEffect(() => {
    if (hydrated) saveToStorage(STORAGE_KEYS.USERS, users)
  }, [users, hydrated])

  // Save departments when changed
  useEffect(() => {
    if (hydrated) saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments)
  }, [departments, hydrated])

  // Save settings when changed
  useEffect(() => {
    if (hydrated && settings) {
      saveToStorage(STORAGE_KEYS.SETTINGS, settings)
    }
  }, [settings, hydrated])

  // Save session when changed
  useEffect(() => {
    if (hydrated) {
      if (session) {
        saveToStorage(STORAGE_KEYS.SESSION, session)
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION)
      }
    }
  }, [session, hydrated])

  // Check if setup is completed
  const isSetupCompleted = settings?.setupCompleted ?? false

  // Check if user is authenticated
  const isAuthenticated = !!session && new Date(session.expiresAt) > new Date()

  // Get current user
  const currentUser = session ? users.find(u => u.id === session.userId) || null : null

  // Complete setup
  const completeSetup = useCallback((data: SetupFormData) => {
    const now = new Date().toISOString()

    // Create departments
    const newDepartments: Department[] = data.departments.map(dept => ({
      id: generateId(),
      name: dept.name,
      description: dept.description,
      createdAt: now,
      updatedAt: now,
    }))

    // Create admin user
    const adminUser: User = {
      id: generateId(),
      username: data.adminUsername.toLowerCase(),
      passwordHash: simpleHash(data.adminPassword),
      email: data.adminEmail,
      fullName: data.adminFullName,
      role: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    // Create company settings
    const companySettings: CompanySettings = {
      id: generateId(),
      companyName: data.companyName,
      setupCompleted: true,
      setupCompletedAt: now,
      maxFileSize: 10, // 10 MB default
      allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'],
      createdAt: now,
      updatedAt: now,
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Saving setup data to localStorage:')
      console.log('  Company:', companySettings.companyName)
      console.log('  Admin user:', adminUser.username)
      console.log('  Departments:', newDepartments.length)
    }

    setDepartments(newDepartments)
    setUsers([adminUser])
    setSettings(companySettings)

    return { success: true, adminUser }
  }, [])

  // Login
  const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())
    
    if (!user) {
      return { success: false, error: 'Kullanıcı bulunamadı' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Hesap devre dışı' }
    }

    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Şifre yanlış' }
    }

    // Create session (24 hours)
    const newSession: Session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    setSession(newSession)
    return { success: true }
  }, [users])

  // Logout
  const logout = useCallback(() => {
    setSession(null)
  }, [])

  // Add user
  const addUser = useCallback((userData: Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'> & { password: string }) => {
    const now = new Date().toISOString()
    const newUser: User = {
      id: generateId(),
      username: userData.username.toLowerCase(),
      passwordHash: simpleHash(userData.password),
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      departmentId: userData.departmentId,
      isActive: userData.isActive,
      createdAt: now,
      updatedAt: now,
    }
    setUsers(prev => [...prev, newUser])
    return newUser
  }, [])

  // Update user
  const updateUser = useCallback((id: string, updates: Partial<User> & { password?: string }) => {
    setUsers(prev => prev.map(user => {
      if (user.id !== id) return user
      const updated = { ...user, ...updates, updatedAt: new Date().toISOString() }
      if (updates.password) {
        updated.passwordHash = simpleHash(updates.password)
      }
      delete (updated as unknown as Record<string, unknown>).password
      return updated
    }))
  }, [])

  // Delete user
  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  // Add department
  const addDepartment = useCallback((name: string, description?: string) => {
    const now = new Date().toISOString()
    const newDept: Department = {
      id: generateId(),
      name,
      description,
      createdAt: now,
      updatedAt: now,
    }
    setDepartments(prev => [...prev, newDept])
    return newDept
  }, [])

  // Update department
  const updateDepartment = useCallback((id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(dept => {
      if (dept.id !== id) return dept
      return { ...dept, ...updates, updatedAt: new Date().toISOString() }
    }))
  }, [])

  // Delete department
  const deleteDepartment = useCallback((id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id))
    // Remove department from users
    setUsers(prev => prev.map(u => u.departmentId === id ? { ...u, departmentId: undefined } : u))
  }, [])

  // Update settings
  const updateSettings = useCallback((updates: Partial<CompanySettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null)
  }, [])

  // Get department by ID
  const getDepartment = useCallback((id: string) => {
    return departments.find(d => d.id === id)
  }, [departments])

  // Get user by ID
  const getUser = useCallback((id: string) => {
    return users.find(u => u.id === id)
  }, [users])

  // Get department leader
  const getDepartmentLeader = useCallback((departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId)
    if (!dept?.leaderId) return null
    return users.find(u => u.id === dept.leaderId) || null
  }, [departments, users])

  // Get users by department
  const getUsersByDepartment = useCallback((departmentId: string) => {
    return users.filter(u => u.departmentId === departmentId)
  }, [users])

  return {
    // State
    hydrated,
    users,
    departments,
    settings,
    session,
    isSetupCompleted,
    isAuthenticated,
    currentUser,

    // Actions
    completeSetup,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    updateSettings,

    // Helpers
    getDepartment,
    getUser,
    getDepartmentLeader,
    getUsersByDepartment,
  }
}

// Auth Context
type AuthContextType = ReturnType<typeof useAuthStore>

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

