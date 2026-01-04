import { DataType, StoredFile, FileArea } from '@/types'

const EXTENSION_MAP: Record<string, DataType> = {
  pdf: 'text_documents',
  doc: 'text_documents',
  docx: 'text_documents',
  txt: 'text_documents',
  md: 'text_documents',
  markdown: 'text_documents',
  rtf: 'text_documents',
  xlsx: 'data_files',
  xls: 'data_files',
  csv: 'data_files',
  tsv: 'data_files',
  ppt: 'presentations',
  pptx: 'presentations',
  key: 'presentations',
  jpg: 'images',
  jpeg: 'images',
  png: 'images',
  gif: 'images',
  webp: 'images',
  svg: 'images',
  mp4: 'videos',
  avi: 'videos',
  mov: 'videos',
  webm: 'videos',
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  ogg: 'audio',
  json: 'structured_data',
  xml: 'structured_data',
  yaml: 'structured_data',
  yml: 'structured_data',
  link: 'external_links',
}

export const getDataTypeFromExtension = (fileName: string): DataType => {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  return EXTENSION_MAP[ext] || 'text_documents'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const createStoredFile = (
  file: File,
  area: FileArea,
  opts?: { departmentName?: string; uploadedBy?: string; ownerId?: string; ownerName?: string; autoApprove?: boolean; submitNote?: string }
): StoredFile => {
  const type = getDataTypeFromExtension(file.name)
  const uploadedAt = new Date().toISOString()
  const sizeLabel = formatFileSize(file.size)
  const ownerId = opts?.ownerId || 'user-demo'
  const ownerName = opts?.ownerName || opts?.uploadedBy || 'Siz'
  const status: 'pending' | 'approved' | 'rejected' = area === 'personal' || opts?.autoApprove ? 'approved' : 'pending'

  return {
    id: `${area}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type,
    area,
    departmentName: opts?.departmentName,
    uploadedBy: opts?.uploadedBy || 'Siz',
    ownerId,
    ownerName,
    sizeLabel,
    sizeBytes: file.size,
    uploadedAt,
    isGeneral: area === 'general',
    isPersonal: area === 'personal',
    status,
    submitNote: opts?.submitNote,
    previewUrl: undefined, // kalıcı depolamada blob URL tutmuyoruz
    mimeType: file.type || undefined,
  }
}

export const seedGeneralFiles = (): StoredFile[] => {
  // No seed files - start with empty array
  return []
}

