import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`

  const res = await fetch(`${baseUrl}/api/notificacoes/enviar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
    body: JSON.stringify({
      titulo: 'Vai pegar uma reunião hoje?',
      corpo: 'Não esqueça de fazer o check-in antes de começar!',
      url: '/',
    }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
