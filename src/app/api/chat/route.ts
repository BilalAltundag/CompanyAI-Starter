import { NextRequest, NextResponse } from 'next/server'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { promises as fs } from 'fs'
import path from 'path'

// LangSmith Configuration - otomatik olarak environment variable'lardan okunur
// LANGSMITH_TRACING=true
// LANGSMITH_ENDPOINT=https://api.smith.langchain.com
// LANGSMITH_API_KEY=...
// LANGSMITH_PROJECT=company_ai
// LangChain otomatik olarak bu değişkenleri kullanır ve tüm çağrıları LangSmith'e gönderir

// Gemini 2.0 Flash desteklenen formatlar:
// text/plain, application/pdf, image/*, video/*, audio/*
// Demo için .txt dosyaları kullanacağız

interface ChatRequest {
  message: string
  systemPrompt?: string
  scopes: string[]
  files: Array<{
    id: string
    name: string
    content?: string
    area: string
    previewUrl?: string
    savedFilename?: string
  }>
  history: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

// Read file content from disk
async function readFileContent(savedFilename: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', savedFilename)
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error('Error reading file:', savedFilename, error)
    return ''
  }
}

// Get document chunks - reads real file content from disk
async function getRelevantChunks(files: ChatRequest['files']): Promise<Array<{
  fileId: string
  fileName: string
  content: string
}>> {
  const chunks: Array<{
    fileId: string
    fileName: string
    content: string
  }> = []

  for (const file of files) {
    let content = ''
    
    // Try to read from disk if savedFilename exists
    if (file.savedFilename) {
      content = await readFileContent(file.savedFilename)
    }
    
    // Fallback to provided content or empty
    if (!content && file.content) {
      content = file.content
    }
    
    if (content) {
      chunks.push({
        fileId: file.id,
        fileName: file.name,
        content: content.substring(0, 10000) // Limit content size to 10KB per file
      })
    }
  }

  return chunks.slice(0, 5) // Return top 5 files
}

// Classify if message is related to documents/company
async function classifyMessage(
  message: string,
  model: ChatGoogleGenerativeAI,
  availableFiles: Array<{ name: string }>
): Promise<'document' | 'general'> {
  const fileNames = availableFiles.map(f => f.name).join(', ')
  
  const classificationPrompt = `Kullanıcının mesajını analiz et ve şu kriterlere göre sınıflandır:

1. "document" - Eğer mesaj şunlarla ilgiliyse:
   - Şirket, departman, çalışan, politika, kural, prosedür gibi şirket içi konular
   - Mevcut dökümanlarda bulunabilecek bilgiler (${fileNames})
   - Şirket verileri, hedefler, süreçler
   - İş ile ilgili spesifik sorular

2. "general" - Eğer mesaj şunlarla ilgiliyse:
   - Genel sohbet, selamlaşma, teşekkür
   - Genel bilgi soruları (şirket dışı)
   - Kişisel konuşmalar
   - Şirket/dökümanlarla ilgisi olmayan konular

Kullanıcı mesajı: "${message}"

Sadece "document" veya "general" kelimesini döndür, başka bir şey yazma.`

  try {
    const response = await model.invoke([
      new SystemMessage('Sen bir mesaj sınıflandırıcısısın. Sadece "document" veya "general" kelimesini döndür.'),
      new HumanMessage(classificationPrompt)
    ])
    
    const result = typeof response.content === 'string' 
      ? response.content.trim().toLowerCase()
      : JSON.stringify(response.content).toLowerCase()
    
    if (result.includes('document')) {
      return 'document'
    }
    return 'general'
  } catch (error) {
    console.error('Classification error, defaulting to general:', error)
    // Default to general if classification fails
    return 'general'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, systemPrompt, files, history } = body

    // LangSmith configuration check (development only)
    if (process.env.NODE_ENV === 'development') {
      const langsmithTracing = process.env.LANGSMITH_TRACING === 'true'
      if (langsmithTracing) {
        console.log('LangSmith Tracing: ENABLED')
      }
    }

    // Get relevant document chunks (reads from disk)
    const relevantChunks = await getRelevantChunks(files)

    // Check for API key
    const apiKey = process.env.GOOGLE_API_KEY
    
    if (!apiKey) {
      // Demo mode without API key
      return handleDemoMode(message, relevantChunks)
    }

    // Initialize Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey,
      temperature: 0.3,
    })
    
    // Step 1: Classify the message - is it document-related or general?
    const messageType = await classifyMessage(message, model, files)
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Message type:', messageType)
    }
    
    let content: string
    let citations: Array<{
      id: string
      sourceId: string
      sourceName: string
      content: string
      index: number
    }> = []
    
    if (messageType === 'document' && relevantChunks.length > 0) {
      // RAG Mode: Use documents, include citations
      if (process.env.NODE_ENV === 'development') {
        console.log('📚 Using RAG mode with documents')
      }
      
      const context = `Aşağıdaki dokümanlardan bilgi kullanarak cevap ver:\n\n${relevantChunks.map((c, i) => 
        `[${i + 1}] ${c.fileName}:\n${c.content}`
      ).join('\n\n')}`

      const messages = [
        new SystemMessage(
          `${systemPrompt || 'Sen yardımcı bir asistansın.'}\n\n` +
          `Kullanıcının sorularını cevaplarken aşağıdaki kurallara uy:\n` +
          `1. Sadece verilen dokümanlardaki bilgileri kullan\n` +
          `2. Cevabında hangi kaynaktan bilgi aldığını [1], [2] gibi dipnot ile belirt\n` +
          `3. Dokümanlarda bilgi yoksa "Yetkim dahilindeki dokümanlarda bu bilgi bulunmamaktadır" de\n` +
          `4. Türkçe cevap ver\n\n` +
          `Bağlam:\n${context}`
        ),
        // Add history
        ...history.map(h => 
          h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content)
        ),
        new HumanMessage(message)
      ]
      
      try {
        const response = await model.invoke(messages)
        
        if (typeof response.content === 'string') {
          content = response.content
        } else if (Array.isArray(response.content)) {
          content = response.content.map((c: any) => 
            typeof c === 'string' ? c : c?.text || JSON.stringify(c)
          ).join('\n')
        } else {
          content = JSON.stringify(response.content)
        }
        
        // Extract citations from response - only include files that are actually referenced
        // Look for [1], [2], etc. in the response
        const citationPattern = /\[(\d+)\]/g
        const referencedIndices = new Set<number>()
        let match
        
        while ((match = citationPattern.exec(content)) !== null) {
          const index = parseInt(match[1], 10)
          if (index > 0 && index <= relevantChunks.length) {
            referencedIndices.add(index - 1) // Convert to 0-based index
          }
        }
        
        // Only include citations for files that were actually referenced
        if (referencedIndices.size > 0) {
          citations = Array.from(referencedIndices)
            .sort((a, b) => a - b)
            .map((chunkIndex, displayIndex) => ({
              id: `cite-${displayIndex + 1}`,
              sourceId: relevantChunks[chunkIndex].fileId,
              sourceName: relevantChunks[chunkIndex].fileName,
              content: relevantChunks[chunkIndex].content,
              index: displayIndex + 1
            }))
        } else {
          // If no citations found in response, don't show any
          citations = []
        }
      } catch (modelError: any) {
        console.error('RAG mode error:', modelError)
        return handleDemoMode(message, relevantChunks)
      }
    } else {
      // General Mode: Normal conversation, no citations
      if (process.env.NODE_ENV === 'development') {
        console.log('💬 Using general conversation mode')
      }
      
      const messages = [
        new SystemMessage(
          `${systemPrompt || 'Sen yardımcı bir asistansın. Normal sohbet edebilirsin. Türkçe cevap ver.'}`
        ),
        // Add history
        ...history.map(h => 
          h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content)
        ),
        new HumanMessage(message)
      ]
      
      try {
        const response = await model.invoke(messages)
        
        if (typeof response.content === 'string') {
          content = response.content
        } else if (Array.isArray(response.content)) {
          content = response.content.map((c: any) => 
            typeof c === 'string' ? c : c?.text || JSON.stringify(c)
          ).join('\n')
        } else {
          content = JSON.stringify(response.content)
        }
        
        // No citations for general conversations
        citations = []
      } catch (modelError: any) {
        console.error('General mode error:', modelError)
        // Fallback to simple response
        content = 'Üzgünüm, şu anda cevap veremiyorum. Lütfen tekrar deneyin.'
      }
    }

    return NextResponse.json({
      content,
      citations
    })

  } catch (error) {
    console.error('Chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    return NextResponse.json(
      { error: 'Chat işlemi başarısız oldu', details: errorMessage },
      { status: 500 }
    )
  }
}

// Demo mode response when no API key is available
// Only includes citations if documents are available
function handleDemoMode(message: string, relevantChunks: Array<{ fileId: string; fileName: string; content: string }>) {
  let response: string
  let citations: Array<{
    id: string
    sourceId: string
    sourceName: string
    content: string
    index: number
  }> = []
  
  if (relevantChunks.length > 0) {
    // Document-related response with citations
    // In demo mode, we show all chunks but only cite the ones we reference
    response = `Dokümanlarda şu bilgileri buldum:\n\n`
    const usedChunks: number[] = []
    relevantChunks.forEach((chunk, i) => {
      response += `[${i + 1}] ${chunk.content.substring(0, 500)}...\n\n`
      usedChunks.push(i)
    })
    response += `\n*Bu bilgiler ${relevantChunks.map(c => c.fileName).join(', ')} kaynaklarından alınmıştır.*`
    
    // Only include citations for chunks that were actually referenced in the response
    const citationPattern = /\[(\d+)\]/g
    const referencedIndices = new Set<number>()
    let match
    
    while ((match = citationPattern.exec(response)) !== null) {
      const index = parseInt(match[1], 10)
      if (index > 0 && index <= relevantChunks.length) {
        referencedIndices.add(index - 1) // Convert to 0-based index
      }
    }
    
    if (referencedIndices.size > 0) {
      citations = Array.from(referencedIndices)
        .sort((a, b) => a - b)
        .map((chunkIndex, displayIndex) => ({
          id: `cite-${displayIndex + 1}`,
          sourceId: relevantChunks[chunkIndex].fileId,
          sourceName: relevantChunks[chunkIndex].fileName,
          content: relevantChunks[chunkIndex].content,
          index: displayIndex + 1
        }))
    } else {
      // Fallback: if no citations found, show all (for demo mode)
      citations = relevantChunks.map((chunk, index) => ({
        id: `cite-${index + 1}`,
        sourceId: chunk.fileId,
        sourceName: chunk.fileName,
        content: chunk.content,
        index: index + 1
      }))
    }
  } else {
    // General response without citations
    response = 'Merhaba! Size nasıl yardımcı olabilirim?'
  }

  return NextResponse.json({
    content: response,
    citations,
    demoMode: true
  })
}

