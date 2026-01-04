export type DataScope = 'general' | 'department' | 'personal' | 'custom'

export interface ChatbotConfig {
  id: string
  name: string
  systemPrompt?: string
  scopes: DataScope[]
  customFileIds?: string[] // For 'custom' scope
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp: string
}

export interface Citation {
  id: string
  sourceId: string
  sourceName: string
  content: string
  pageNumber?: number
}

export interface ChatSession {
  id: string
  chatbotId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

