import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Chave não configurada' }, { status: 500 })

  const form = await req.formData()
  const audio = form.get('audio') as File | null
  if (!audio) return NextResponse.json({ error: 'Áudio não recebido' }, { status: 400 })

  const bytes = await audio.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = audio.type || 'audio/webm'

  const body = {
    contents: [{
      parts: [
        {
          inlineData: { mimeType, data: base64 },
        },
        {
          text: 'Transcreva este áudio em português brasileiro. Adicione pontuação adequada (vírgulas, pontos finais, reticências). Retorne apenas o texto transcrito, sem comentários ou explicações.',
        },
      ],
    }],
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const json = await res.json()
  const texto = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return NextResponse.json({ texto })
}
