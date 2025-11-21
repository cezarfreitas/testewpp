'use client'

import { useEffect, useState } from 'react'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
          WhatsApp Web
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Conecte seu WhatsApp escaneando o QR Code
        </p>
        <QRCodeDisplay />
        
        <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
          <Link
            href="/send"
            className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            📤 Enviar Mensagem
          </Link>
          <Link
            href="/messages"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            📨 Ver Mensagens Recebidas
          </Link>
        </div>
      </div>
    </main>
  )
}

