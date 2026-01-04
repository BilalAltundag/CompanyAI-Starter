import { DataType } from '@/types'

// Dosya okuma sonuçları için interface
export interface FileContent {
  text: string
  metadata: Record<string, any>
  error?: string
}

// PDF dosyalarını okuma fonksiyonu
export async function readPDFFile(file: File): Promise<FileContent> {
  try {
    // Sunucu derlemesinde canvas bağımlılığını tetiklememek için PDF.js kullanmıyoruz.
    // Gelecekte sunucuya bağımlı olmayan bir PDF parser eklenecek.
    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'pdf',
      note: 'PDF içeriği henüz işlenmiyor; hızlı önizleme.'
    }

    return {
      text: '[PDF içeriği burada özetlenecek]',
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'pdf' },
      error: `PDF okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Word belgelerini okuma fonksiyonu
export async function readWordFile(file: File): Promise<FileContent> {
  try {
    // mammoth.js kütüphanesini dinamik olarak import edelim
    const mammoth = await import('mammoth')

    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: file.name.endsWith('.docx') ? 'docx' : 'doc',
      messages: result.messages
    }

    return {
      text: result.value.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'word' },
      error: `Word dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Excel dosyalarını okuma fonksiyonu
export async function readExcelFile(file: File): Promise<FileContent> {
  try {
    // xlsx kütüphanesini dinamik olarak import edelim
    const XLSX = await import('xlsx')

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    let fullText = ''
    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: file.name.endsWith('.xlsx') ? 'xlsx' : 'xls',
      sheets: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames
    }

    // Tüm sheet'leri oku
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName]
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      fullText += `=== ${sheetName} ===\n`

      sheetData.forEach((row: any) => {
        if (Array.isArray(row)) {
          fullText += row.map(cell => String(cell || '')).join('\t') + '\n'
        }
      })

      fullText += '\n'
    })

    return {
      text: fullText.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'excel' },
      error: `Excel dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// CSV dosyalarını okuma fonksiyonu
export async function readCSVFile(file: File): Promise<FileContent> {
  try {
    const text = await file.text()
    const lines = text.split('\n')

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'csv',
      rows: lines.length,
      estimatedColumns: lines[0] ? lines[0].split(',').length : 0
    }

    return {
      text: text.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'csv' },
      error: `CSV dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// JSON dosyalarını okuma fonksiyonu
export async function readJSONFile(file: File): Promise<FileContent> {
  try {
    const text = await file.text()
    const jsonData = JSON.parse(text)

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'json',
      isArray: Array.isArray(jsonData),
      keys: Array.isArray(jsonData) ? null : Object.keys(jsonData),
      itemCount: Array.isArray(jsonData) ? jsonData.length : 1
    }

    return {
      text: JSON.stringify(jsonData, null, 2),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'json' },
      error: `JSON dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// XML dosyalarını okuma fonksiyonu
export async function readXMLFile(file: File): Promise<FileContent> {
  try {
    const text = await file.text()

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'xml'
    }

    return {
      text: text.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'xml' },
      error: `XML dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// YAML dosyalarını okuma fonksiyonu
export async function readYAMLFile(file: File): Promise<FileContent> {
  try {
    // js-yaml kütüphanesini dinamik olarak import edelim
    const yaml = await import('js-yaml')
    const text = await file.text()
    const yamlData = yaml.load(text)

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'yaml',
      isObject: typeof yamlData === 'object' && yamlData !== null,
      keys: typeof yamlData === 'object' && yamlData !== null ? Object.keys(yamlData || {}) : null
    }

    return {
      text: text.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'yaml' },
      error: `YAML dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Markdown dosyalarını okuma fonksiyonu
export async function readMarkdownFile(file: File): Promise<FileContent> {
  try {
    const text = await file.text()

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'markdown'
    }

    return {
      text: text.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'markdown' },
      error: `Markdown dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Metin dosyalarını okuma fonksiyonu
export async function readTextFile(file: File): Promise<FileContent> {
  try {
    const text = await file.text()

    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'text',
      lineCount: text.split('\n').length,
      charCount: text.length
    }

    return {
      text: text.trim(),
      metadata
    }
  } catch (error) {
    return {
      text: '',
      metadata: { fileName: file.name, type: 'text' },
      error: `Metin dosyası okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Görsel dosyalarını işleme fonksiyonu (metadata çıkarımı)
export async function processImageFile(file: File): Promise<FileContent> {
  try {
    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'image'
    }

    // Resim boyutlarını al
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        metadata.width = img.width
        metadata.height = img.height
        metadata.aspectRatio = img.width / img.height
        URL.revokeObjectURL(img.src)

        resolve({
          text: `[Görsel: ${file.name} - ${img.width}x${img.height}]`,
          metadata
        })
      }
      img.onerror = () => {
        resolve({
          text: `[Görsel: ${file.name}]`,
          metadata
        })
      }
      img.src = URL.createObjectURL(file)
    })
  } catch (error) {
    return {
      text: `[Görsel: ${file.name}]`,
      metadata: { fileName: file.name, type: 'image' },
      error: `Görsel işleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Video dosyalarını işleme fonksiyonu (metadata çıkarımı)
export async function processVideoFile(file: File): Promise<FileContent> {
  try {
    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      type: 'video'
    }

    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        metadata.duration = video.duration
        metadata.width = video.videoWidth
        metadata.height = video.videoHeight
        metadata.aspectRatio = video.videoWidth / video.videoHeight

        resolve({
          text: `[Video: ${file.name} - ${Math.round(video.duration)}s, ${video.videoWidth}x${video.videoHeight}]`,
          metadata
        })
      }
      video.onerror = () => {
        resolve({
          text: `[Video: ${file.name}]`,
          metadata
        })
      }
      video.src = URL.createObjectURL(file)
    })
  } catch (error) {
    return {
      text: `[Video: ${file.name}]`,
      metadata: { fileName: file.name, type: 'video' },
      error: `Video işleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    }
  }
}

// Ana dosya okuma fonksiyonu - dosya tipine göre uygun fonksiyonu çağırır
export async function readFile(file: File): Promise<FileContent> {
  const extension = file.name.toLowerCase().split('.').pop()

  switch (extension) {
    case 'pdf':
      return await readPDFFile(file)

    case 'docx':
    case 'doc':
      return await readWordFile(file)

    case 'xlsx':
    case 'xls':
      return await readExcelFile(file)

    case 'csv':
    case 'tsv':
      return await readCSVFile(file)

    case 'json':
      return await readJSONFile(file)

    case 'xml':
      return await readXMLFile(file)

    case 'yaml':
    case 'yml':
      return await readYAMLFile(file)

    case 'md':
    case 'markdown':
      return await readMarkdownFile(file)

    case 'txt':
      return await readTextFile(file)

    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return await processImageFile(file)

    case 'mp4':
    case 'avi':
    case 'mov':
    case 'webm':
      return await processVideoFile(file)

    default:
      // Bilinmeyen dosya tipi için genel metin okumayı dene
      try {
        return await readTextFile(file)
      } catch {
        return {
          text: `[Dosya: ${file.name}]`,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            type: 'unknown',
            extension
          },
          error: 'Desteklenmeyen dosya tipi'
        }
      }
  }
}

// Toplu dosya okuma fonksiyonu
export async function readMultipleFiles(files: File[]): Promise<FileContent[]> {
  const results: FileContent[] = []

  for (const file of files) {
    try {
      const result = await readFile(file)
      results.push(result)
    } catch (error) {
      results.push({
        text: '',
        metadata: { fileName: file.name, type: 'error' },
        error: `Dosya okuma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      })
    }
  }

  return results
}
