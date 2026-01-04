'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileArea, StoredFile } from '@/types'
import { createStoredFile, seedGeneralFiles } from '@/lib/file-utils'

const STORAGE_KEY = 'company-ai-files'

/** Upload files to server */
async function uploadFilesToServer(files: File[]): Promise<Array<{
  originalName: string
  savedName: string
  url: string
  size: number
  mimeType: string
}>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result.files || []
  } catch (error) {
    console.error('Failed to upload files:', error)
    return []
  }
}

/** Delete file from server */
async function deleteFileFromServer(filename: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
}

const loadFromStorage = (): StoredFile[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredFile[]
    // Server-stored files already have previewUrl set to the server path
    return parsed.map((f) => ({
      ...f,
      // If file has serverUrl, use it as previewUrl
      previewUrl: f.previewUrl || undefined,
    }))
  } catch {
    return []
  }
}

const saveToStorage = (files: StoredFile[]) => {
  if (typeof window === 'undefined') return
  // Don't save fileData (base64) to localStorage anymore - files are on server
  const filesToSave = files.map(({ fileData, ...rest }) => rest)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filesToSave))
}

export function useLocalFiles() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored.length > 0) {
      setFiles(stored)
    } else {
      const seeded = seedGeneralFiles()
      setFiles(seeded)
      saveToStorage(seeded)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(files)
  }, [files, hydrated])

  const addFiles = async (
    fileList: File[],
    area: FileArea,
    opts?: { departmentName?: string; uploadedBy?: string; ownerId?: string; ownerName?: string; autoApprove?: boolean; submitNote?: string }
  ) => {
    setUploading(true)
    
    try {
      // Upload files to server
      const uploadedFiles = await uploadFilesToServer(fileList)
      
      // Create StoredFile objects with server URLs
      const newFiles = fileList.map((file, index) => {
        const stored = createStoredFile(file, area, opts)
        const uploaded = uploadedFiles.find(u => u.originalName === file.name) || uploadedFiles[index]
        
        return {
          ...stored,
          // Use server URL for preview - this persists across page reloads
          previewUrl: uploaded?.url || undefined,
          savedFilename: uploaded?.savedName || undefined,
          mimeType: file.type || 'application/octet-stream',
        }
      })
      
      setFiles((prev) => [...newFiles, ...prev])
    } finally {
      setUploading(false)
    }
  }

  const removeFile = async (id: string) => {
    const file = files.find(f => f.id === id)
    
    // If file has a saved filename, delete from server
    if (file?.savedFilename) {
      await deleteFileFromServer(file.savedFilename)
    }
    
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateStatus = (id: string, status: 'approved' | 'rejected', reviewNote?: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, reviewNote } : f))
    )
  }

  const generalFiles = useMemo(() => files.filter((f) => f.area === 'general'), [files])
  const departmentFiles = useMemo(() => files.filter((f) => f.area === 'department'), [files])
  // Personal files are NOT filtered here - components must filter by currentUser.id
  const allPersonalFiles = useMemo(() => files.filter((f) => f.area === 'personal'), [files])

  // Helper to get personal files for a specific user
  const getPersonalFilesForUser = (userId: string) => {
    return allPersonalFiles.filter((f) => f.ownerId === userId)
  }

  return {
    hydrated,
    uploading,
    files,
    generalFiles,
    departmentFiles,
    personalFiles: allPersonalFiles, // Raw - components should filter by userId
    getPersonalFilesForUser, // Helper function
    addFiles,
    removeFile,
    updateStatus,
    setFiles,
  }
}
