'use client'

import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@/components/layout/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useChatbots } from '@/hooks/use-chatbots'
import { useLocalFiles } from '@/hooks/use-local-files'
import { useAuth } from '@/hooks/use-auth'
import { ChatbotConfig, ChatMessage, DataScope, Citation } from '@/types/chatbot'
import {
  Plus,
  Bot,
  Send,
  Trash2,
  X,
  FileText,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Database,
  Users,
  User,
  Settings
} from 'lucide-react'

export default function ChatPage() {
  const { currentUser, getDepartment } = useAuth()
  const { chatbots, sessions, createChatbot, deleteChatbot, getOrCreateSession, addMessage, clearSession, hydrated } = useChatbots(currentUser?.id)
  const { files } = useLocalFiles()
  
  // Filter chatbots to show only current user's chatbots
  const userChatbots = chatbots.filter(bot => bot.createdBy === currentUser?.id)
  
  const [selectedBot, setSelectedBot] = useState<ChatbotConfig | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Get user's department
  const userDept = currentUser?.departmentId ? getDepartment(currentUser.departmentId) : null

  // Get current session
  const currentSession = selectedBot ? sessions.find(s => s.chatbotId === selectedBot.id) : null

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [currentSession?.messages])

  // Filter files based on bot's scopes
  const getAccessibleFiles = (bot: ChatbotConfig) => {
    return files.filter(file => {
      if (bot.scopes.includes('general') && file.area === 'general') return true
      if (bot.scopes.includes('department') && file.area === 'department' && file.departmentName === userDept?.name) return true
      if (bot.scopes.includes('personal') && file.area === 'personal' && file.ownerId === currentUser?.id) return true
      if (bot.scopes.includes('custom') && bot.customFileIds?.includes(file.id)) return true
      return false
    })
  }

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedBot || isLoading) return

    const session = getOrCreateSession(selectedBot.id)
    
    // Add user message
    addMessage(session.id, {
      role: 'user',
      content: inputMessage
    })

    const userMsg = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      const accessibleFiles = getAccessibleFiles(selectedBot)
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          systemPrompt: selectedBot.systemPrompt,
          scopes: selectedBot.scopes,
          files: accessibleFiles.map(f => ({
            id: f.id,
            name: f.name,
            area: f.area,
            previewUrl: f.previewUrl,
            savedFilename: f.savedFilename
          })),
          history: (currentSession?.messages || []).slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()
      
      addMessage(session.id, {
        role: 'assistant',
        content: data.content,
        citations: data.citations
      })
    } catch (error) {
      console.error('Chat error:', error)
      addMessage(session.id, {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!hydrated) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          
          {!selectedBot ? (
            // Chatbot List View
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Chatbotlarım</h1>
                  <p className="text-gray-600">AI asistanlarınızı yönetin</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Asistan
                </Button>
              </div>

              {userChatbots.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bot className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Henüz asistan yok</h3>
                    <p className="text-gray-600 mb-4">
                      İlk AI asistanınızı oluşturun ve verilerinizle sohbet edin
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Asistan Oluştur
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userChatbots.map(bot => {
                    const botSession = sessions.find(s => s.chatbotId === bot.id)
                    const accessibleFiles = getAccessibleFiles(bot)
                    
                    return (
                      <Card 
                        key={bot.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedBot(bot)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{bot.name}</CardTitle>
                                <CardDescription>
                                  {accessibleFiles.length} dosya erişimi
                                </CardDescription>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Bu asistanı silmek istediğinize emin misiniz?')) {
                                  deleteChatbot(bot.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {bot.scopes.map(scope => (
                              <span 
                                key={scope}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  scope === 'general' ? 'bg-blue-100 text-blue-700' :
                                  scope === 'department' ? 'bg-green-100 text-green-700' :
                                  scope === 'personal' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {scope === 'general' ? 'Genel' : 
                                 scope === 'department' ? 'Departman' : 
                                 scope === 'personal' ? 'Kişisel' : 'Özel'}
                              </span>
                            ))}
                          </div>
                          {botSession && botSession.messages.length > 0 && (
                            <p className="text-sm text-gray-500">
                              {botSession.messages.length} mesaj
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            // Chat View
            <div className="flex gap-4 h-[calc(100vh-200px)]">
              {/* Chat Panel */}
              <div className="flex-1 flex flex-col bg-white rounded-xl border shadow-sm">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBot(null)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-medium">{selectedBot.name}</h2>
                      <p className="text-xs text-gray-500">
                        {getAccessibleFiles(selectedBot).length} dosya erişimi
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const session = sessions.find(s => s.chatbotId === selectedBot.id)
                      if (session) clearSession(session.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {(!currentSession || currentSession.messages.length === 0) && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Sohbete başlamak için bir soru sorun</p>
                    </div>
                  )}
                  
                  {currentSession?.messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium mb-2 text-gray-600">Kaynaklar:</p>
                            <div className="flex flex-wrap gap-1">
                              {msg.citations.map((cite, i) => (
                                <button
                                  key={cite.id}
                                  onClick={() => setSelectedCitation(cite)}
                                  className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50 text-gray-700"
                                >
                                  [{i + 1}] {cite.sourceName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Sorunuzu yazın..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Citation Panel */}
              {selectedCitation && (
                <div className="w-96 bg-white rounded-xl border shadow-sm flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Kaynak Görüntüleme</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCitation(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">{selectedCitation.sourceName}</span>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedCitation.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Bu içerik dokümandan alıntılanmıştır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Bot Modal */}
      {showCreateModal && (
        <CreateBotModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            createChatbot({
              ...data,
              createdBy: currentUser?.id || 'unknown'
            })
            setShowCreateModal(false)
          }}
          files={files}
          userDept={userDept?.name}
        />
      )}
    </ProtectedRoute>
  )
}

// Create Bot Modal Component
function CreateBotModal({
  onClose,
  onCreate,
  files,
  userDept
}: {
  onClose: () => void
  onCreate: (data: { name: string; systemPrompt?: string; scopes: DataScope[]; customFileIds?: string[] }) => void
  files: any[]
  userDept?: string
}) {
  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [scopes, setScopes] = useState<DataScope[]>(['general'])
  const [customFileIds, setCustomFileIds] = useState<string[]>([])

  const toggleScope = (scope: DataScope) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter(s => s !== scope))
    } else {
      setScopes([...scopes, scope])
    }
  }

  const handleSubmit = () => {
    if (!name.trim() || scopes.length === 0) return
    onCreate({
      name: name.trim(),
      systemPrompt: systemPrompt.trim() || undefined,
      scopes,
      customFileIds: scopes.includes('custom') ? customFileIds : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Yeni Asistan Oluştur</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Asistan Adı *</label>
            <Input
              placeholder="Örn: Pazarlama Asistanı"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium mb-1">Sistem Promptu (Opsiyonel)</label>
            <Textarea
              placeholder="Örn: Sen kıdemli bir pazarlama uzmanı gibi cevap ver..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Data Scopes */}
          <div>
            <label className="block text-sm font-medium mb-2">Veri Kaynakları *</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={scopes.includes('general')}
                  onChange={() => toggleScope('general')}
                  className="w-4 h-4"
                />
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Genel Alan</p>
                  <p className="text-xs text-gray-500">Tüm şirket verileri</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={scopes.includes('department')}
                  onChange={() => toggleScope('department')}
                  className="w-4 h-4"
                />
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Departman Alanı</p>
                  <p className="text-xs text-gray-500">{userDept || 'Departman'} verileri</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={scopes.includes('personal')}
                  onChange={() => toggleScope('personal')}
                  className="w-4 h-4"
                />
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Kişisel Alan</p>
                  <p className="text-xs text-gray-500">Sadece sizin dosyalarınız</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={scopes.includes('custom')}
                  onChange={() => toggleScope('custom')}
                  className="w-4 h-4"
                />
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Özel Seçim</p>
                  <p className="text-xs text-gray-500">Belirli dosyaları seçin</p>
                </div>
              </label>
            </div>
          </div>

          {/* Custom File Selection */}
          {scopes.includes('custom') && (
            <div>
              <label className="block text-sm font-medium mb-2">Dosya Seçimi</label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {files.filter(f => f.status === 'approved').map(file => (
                  <label 
                    key={file.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={customFileIds.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomFileIds([...customFileIds, file.id])
                        } else {
                          setCustomFileIds(customFileIds.filter(id => id !== file.id))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm truncate">{file.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!name.trim() || scopes.length === 0}
            >
              Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
