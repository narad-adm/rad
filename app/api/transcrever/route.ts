import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: 'Chave não configurada' }, { status: 500 })
  }

  const form = await req.formData()
  const audio = form.get('audio') as File | null
  if (!audio) return NextResponse.json({ error: 'Áudio não recebido' }, { status: 400 })

  const bytes = await audio.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = audio.type || 'audio/webm'

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const result = await model.generateContent([
    'Transcreva este áudio em português brasileiro. Adicione pontuação adequada (vírgulas, pontos finais, reticências). Retorne apenas o texto transcrito, sem comentários ou explicações.',
    { inlineData: { mimeType, data: base64 } },
  ])

  const texto = result.response.text().trim()
  return NextResponse.json({ texto })
}
