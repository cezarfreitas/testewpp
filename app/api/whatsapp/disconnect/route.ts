import { NextResponse } from 'next/server'

// No servidor, sempre usar localhost ou variável de ambiente
// Como ambos os servidores rodam no mesmo container, localhost funciona
const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function POST() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/disconnect`, {
      method: 'POST',
    })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao desconectar:', error)
    return NextResponse.json(
      { error: 'Erro ao desconectar' },
      { status: 500 }
    )
  }
}
