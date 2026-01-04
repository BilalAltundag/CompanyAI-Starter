import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Upload directory path
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
  // Sanitize filename - remove special characters
  const safeName = baseName.replace(/[^a-zA-Z0-9-_\u00C0-\u024F\u0400-\u04FF]/g, '_')
  return `${safeName}_${timestamp}_${random}${ext}`
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedFiles: Array<{
      originalName: string
      savedName: string
      url: string
      size: number
      mimeType: string
    }> = []

    for (const file of files) {
      if (!(file instanceof File)) {
        continue
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uniqueFilename = generateUniqueFilename(file.name)
      const filePath = path.join(UPLOAD_DIR, uniqueFilename)

      await writeFile(filePath, buffer)

      uploadedFiles.push({
        originalName: file.name,
        savedName: uniqueFilename,
        url: `/uploads/${uniqueFilename}`,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    const filePath = path.join(UPLOAD_DIR, filename)
    
    // Security check - ensure the path is within UPLOAD_DIR
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    const { unlink, access } = await import('fs/promises')
    const { constants } = await import('fs')
    
    // Check if file exists before trying to delete
    try {
      await access(filePath, constants.F_OK)
      // File exists, delete it
      await unlink(filePath)
    } catch (error: any) {
      // File doesn't exist (ENOENT) - that's okay, consider it already deleted
      if (error.code !== 'ENOENT') {
        // Some other error occurred
        console.error('Delete error:', error)
        return NextResponse.json(
          { error: 'Failed to delete file' },
          { status: 500 }
        )
      }
      // ENOENT means file doesn't exist - that's fine, return success
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}



