// Data Types
export type DataType =
  | 'text_documents'
  | 'data_files'
  | 'presentations'
  | 'images'
  | 'videos'
  | 'audio'
  | 'structured_data'
  | 'external_links'

export interface DataTypeInfo {
  id: DataType
  name: string
  description: string
  extensions: string[]
  purpose: string
}

// Departments
export interface Department {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Users
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  department_ids: string[]
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// Files/Data
export interface CompanyFile {
  id: string
  name: string
  type: DataType
  url: string
  size: number
  department_id?: string
  user_id: string
  is_public: boolean
  is_personal: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// Chatbots
export interface Chatbot {
  id: string
  name: string
  department_id?: string
  user_id?: string
  system_message: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Onboarding Steps
export interface OnboardingState {
  currentStep: number
  departments: Department[]
  users: User[]
  files: CompanyFile[]
}

// Client-side stored file (local/session)
export type FileArea = 'general' | 'department' | 'personal'

export interface StoredFile {
  id: string
  name: string
  type: DataType
  area: FileArea
  departmentName?: string
  uploadedBy?: string
  ownerId: string
  ownerName: string
  sizeLabel: string
  sizeBytes: number
  uploadedAt: string
  isGeneral?: boolean
  isPersonal?: boolean
  content?: string
  metadata?: Record<string, any>
  status: 'pending' | 'approved' | 'rejected'
  submitNote?: string
  reviewNote?: string
  previewUrl?: string
  mimeType?: string
  /** Base64 encoded file data for preview persistence (deprecated - using server storage) */
  fileData?: string
  /** Filename on server for uploaded files */
  savedFilename?: string
}
