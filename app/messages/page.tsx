'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  from: string
  groupId?: string | null
  isGroup?: boolean
  isList?: boolean
  message: string
  timestamp: string
  fullData?: any
}

export default function Messages() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showJson, setShowJson] = useState<{ [key: string]: boolean }>({})

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages')
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
        setError(null)
      } else {
        setError(data.error || 'Erro ao carregar mensagens')
      }
    } catch (err) {
      setError(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = async () => {
    if (!confirm('Tem certeza que deseja limpar todas as mensagens?')) return

    try {
      const response = await fetch('/api/whatsapp/messages', {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages([])
      }
    } catch (err) {
      console.error('Erro ao limpar mensagens:', err)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Atualizar a cada 3 segundos
    return () => clearInterval(interval)
  }, [])

  const toggleJson = (id: string) => {
    setShowJson((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-green-600">Mensagens Recebidas</h1>
            <div className="flex gap-2">
              <button
                onClick={clearMessages}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando mensagens...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma mensagem recebida ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Total: {messages.length} mensagem{messages.length !== 1 ? 's' : ''}
              </div>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-green-600">
                        📱 {msg.from}
                        {msg.isGroup && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Grupo
                          </span>
                        )}
                        {msg.isList && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Lista
                          </span>
                        )}
                      </div>
                      {msg.groupId && (
                        <div className="text-xs text-gray-400 mt-1">
                          Grupo/Lista ID: {msg.groupId.substring(0, 30)}...
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleJson(msg.id)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {showJson[msg.id] ? 'Ocultar JSON' : 'Ver JSON'}
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    {showJson[msg.id] ? (
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(msg.fullData || msg, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-gray-800 whitespace-pre-wrap break-words">
                        {msg.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

