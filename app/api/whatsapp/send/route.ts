import { NextResponse } from 'next/server'

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function POST(request: Request) {
  try {
    const { number, message } = await request.json()

    if (!number || !message) {
      return NextResponse.json(
        { error: 'Número e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number, message }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao enviar mensagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

