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
  const now = new Date().toISOString()
  
  // Genel alan dosyaları
  const generalFiles = [
    { name: 'Şirket Kuralları.txt', savedFilename: 'sirket-kurallari.txt', sizeBytes: 1.8 * 1024 },
  ]

  // Departman dosyaları
  const departmentFiles = [
    { name: 'İK Rehberi.txt', savedFilename: 'insan-kaynaklari-rehberi.txt', sizeBytes: 1.5 * 1024, departmentName: 'İnsan Kaynakları' },
    { name: 'Finans Prosedürleri.txt', savedFilename: 'finans-prosedur.txt', sizeBytes: 1.4 * 1024, departmentName: 'Finans' },
    { name: 'Satış Kılavuzu.txt', savedFilename: 'satis-kilavuz.txt', sizeBytes: 1.6 * 1024, departmentName: 'Satış' },
  ]

  const allFiles: StoredFile[] = []

  // Genel dosyalar
  generalFiles.forEach((item, idx) => {
    const type = getDataTypeFromExtension(item.name)
    allFiles.push({
      id: `general-seed-${idx}`,
      name: item.name,
      type,
      area: 'general',
      sizeLabel: formatFileSize(item.sizeBytes),
      sizeBytes: item.sizeBytes,
      uploadedAt: now,
      uploadedBy: 'Sistem',
      isGeneral: true,
      isPersonal: false,
      ownerId: 'system',
      ownerName: 'Sistem',
      status: 'approved',
      savedFilename: item.savedFilename,
      previewUrl: `/uploads/${item.savedFilename}`,
      mimeType: 'text/plain',
    })
  })

  // Departman dosyaları
  departmentFiles.forEach((item, idx) => {
    const type = getDataTypeFromExtension(item.name)
    allFiles.push({
      id: `dept-seed-${idx}`,
      name: item.name,
      type,
      area: 'department',
      departmentName: item.departmentName,
      sizeLabel: formatFileSize(item.sizeBytes),
      sizeBytes: item.sizeBytes,
      uploadedAt: now,
      uploadedBy: 'Sistem',
      isGeneral: false,
      isPersonal: false,
      ownerId: 'system',
      ownerName: 'Sistem',
      status: 'approved',
      savedFilename: item.savedFilename,
      previewUrl: `/uploads/${item.savedFilename}`,
      mimeType: 'text/plain',
    })
  })

  return allFiles
}

