'use client'

import { useEffect, useState } from 'react'
import { ChatbotConfig, ChatSession, ChatMessage, DataScope } from '@/types/chatbot'

// Storage keys will be user-specific
function getChatbotsKey(userId: string): string {
  return `company-ai-chatbots-${userId}`
}

function getSessionsKey(userId: string): string {
  return `company-ai-chat-sessions-${userId}`
}

// Simple ID generator
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function useChatbots(userId?: string) {
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage - user-specific
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) {
      setHydrated(true)
      return
    }
    
    const chatbotsKey = getChatbotsKey(userId)
    const sessionsKey = getSessionsKey(userId)
    
    const storedBots = localStorage.getItem(chatbotsKey)
    const storedSessions = localStorage.getItem(sessionsKey)
    
    if (storedBots) {
      try {
        setChatbots(JSON.parse(storedBots))
      } catch (e) {
        console.error('Error parsing chatbots:', e)
      }
    }
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions))
      } catch (e) {
        console.error('Error parsing sessions:', e)
      }
    }
    setHydrated(true)
  }, [userId])

  // Save chatbots to localStorage - user-specific
  useEffect(() => {
    if (!hydrated || !userId) return
    const chatbotsKey = getChatbotsKey(userId)
    localStorage.setItem(chatbotsKey, JSON.stringify(chatbots))
  }, [chatbots, hydrated, userId])

  // Save sessions to localStorage - user-specific
  useEffect(() => {
    if (!hydrated || !userId) return
    const sessionsKey = getSessionsKey(userId)
    localStorage.setItem(sessionsKey, JSON.stringify(sessions))
  }, [sessions, hydrated, userId])

  // Create new chatbot
  const createChatbot = (data: {
    name: string
    systemPrompt?: string
    scopes: DataScope[]
    customFileIds?: string[]
    createdBy: string
  }): ChatbotConfig => {
    const now = new Date().toISOString()
    const newBot: ChatbotConfig = {
      id: generateId(),
      name: data.name,
      systemPrompt: data.systemPrompt,
      scopes: data.scopes,
      customFileIds: data.customFileIds,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now
    }
    setChatbots(prev => [...prev, newBot])
    return newBot
  }

  // Update chatbot
  const updateChatbot = (id: string, updates: Partial<ChatbotConfig>) => {
    setChatbots(prev => prev.map(bot => 
      bot.id === id ? { ...bot, ...updates, updatedAt: new Date().toISOString() } : bot
    ))
  }

  // Delete chatbot
  const deleteChatbot = (id: string) => {
    setChatbots(prev => prev.filter(bot => bot.id !== id))
    // Also delete related sessions
    setSessions(prev => prev.filter(s => s.chatbotId !== id))
  }

  // Get or create session for a chatbot
  const getOrCreateSession = (chatbotId: string): ChatSession => {
    let session = sessions.find(s => s.chatbotId === chatbotId)
    if (!session) {
      const now = new Date().toISOString()
      session = {
        id: generateId(),
        chatbotId,
        messages: [],
        createdAt: now,
        updatedAt: now
      }
      setSessions(prev => [...prev, session!])
    }
    return session
  }

  // Add message to session
  const addMessage = (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString()
    }
    
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, messages: [...s.messages, newMessage], updatedAt: new Date().toISOString() }
        : s
    ))
    
    return newMessage
  }

  // Clear session messages
  const clearSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, messages: [], updatedAt: new Date().toISOString() }
        : s
    ))
  }

  return {
    hydrated,
    chatbots,
    sessions,
    createChatbot,
    updateChatbot,
    deleteChatbot,
    getOrCreateSession,
    addMessage,
    clearSession
  }
}

