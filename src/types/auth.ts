// User roles
export type UserRole = 'admin' | 'leader' | 'employee'

// User interface
export interface User {
  id: string
  username: string
  passwordHash: string
  email: string
  fullName: string
  role: UserRole
  departmentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Department interface
export interface Department {
  id: string
  name: string
  description?: string
  leaderId?: string
  createdAt: string
  updatedAt: string
}

// Company settings
export interface CompanySettings {
  id: string
  companyName: string
  logoUrl?: string
  setupCompleted: boolean
  setupCompletedAt?: string
  maxFileSize: number // in MB
  allowedFileTypes: string[]
  createdAt: string
  updatedAt: string
}

// Auth state
export interface AuthState {
  isAuthenticated: boolean
  currentUser: User | null
  isLoading: boolean
}

// Session
export interface Session {
  userId: string
  username: string
  role: UserRole
  departmentId?: string
  loginAt: string
  expiresAt: string
}

// Setup form data
export interface SetupFormData {
  companyName: string
  adminUsername: string
  adminPassword: string
  adminEmail: string
  adminFullName: string
  departments: Array<{
    name: string
    description?: string
  }>
}

// Login form data
export interface LoginFormData {
  username: string
  password: string
  rememberMe: boolean
}

