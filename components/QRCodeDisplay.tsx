'use client'

import { useEffect, useState } from 'react'

interface StatusResponse {
  status: string
  qrCode: string | null
  connected: boolean
  error?: string
  details?: string
}

export default function QRCodeDisplay() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('close')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      const data: StatusResponse = await response.json()

      console.log('Status recebido:', data)

      if (data.error) {
        setError(`Erro: ${data.error}`)
        setLoading(false)
        return
      }

      setStatus(data.status)
      setQrCode(data.qrCode)
      setLoading(false)

      if (data.connected) {
        setError(null)
      } else if (data.status === 'connecting' && !data.qrCode) {
        setError(null) // Limpa o erro enquanto está conectando
      } else if (data.status === 'close' && !data.qrCode) {
        setError('Aguardando geração do QR code...')
      }
    } catch (err) {
      console.error('Erro ao buscar status:', err)
      setError(`Erro ao conectar com o servidor: ${err instanceof Error ? err.message : 'desconhecido'}`)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    const interval = setInterval(() => {
      if (status !== 'open') {
        fetchStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [status])

  const handleDisconnect = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' })
      setQrCode(null)
      setStatus('close')
      fetchStatus()
    } catch (err) {
      console.error('Erro ao desconectar:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Inicializando conexão...</p>
      </div>
    )
  }

  if (status === 'open') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <svg
            className="w-16 h-16 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-green-600 mb-2">
          Conectado!
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Seu WhatsApp está conectado com sucesso
        </p>
        <button
          onClick={handleDisconnect}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Desconectar
        </button>
      </div>
    )
  }

  if (error && !qrCode) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <svg
            className="w-16 h-16 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <p className="text-red-600 mb-4 text-center">{error}</p>
        <button
          onClick={fetchStatus}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {qrCode ? (
        <>
          <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <img src={qrCode} alt="QR Code" className="w-64 h-64" />
          </div>
          <p className="text-gray-700 text-center mb-2 font-medium">
            Escaneie este QR Code com seu WhatsApp
          </p>
          <p className="text-sm text-gray-500 text-center mb-4">
            Abra o WhatsApp no seu celular → Menu → Dispositivos conectados →
            Conectar um dispositivo
          </p>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Aguardando conexão...</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Gerando QR Code...</p>
        </div>
      )}
    </div>
  )
}

