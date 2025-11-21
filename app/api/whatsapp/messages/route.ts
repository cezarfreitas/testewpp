import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/messages`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao obter mensagens:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao obter mensagens',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/messages`, {
      method: 'DELETE',
    })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao limpar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar mensagens' },
      { status: 500 }
    )
  }
}

