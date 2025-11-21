import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// No servidor, sempre usar localhost ou variável de ambiente
// Como ambos os servidores rodam no mesmo container, localhost funciona
const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/status`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao obter status:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao conectar com o servidor WhatsApp',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
