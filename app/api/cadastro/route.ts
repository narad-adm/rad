import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { userId, nome, dataLimpeza } = await req.json()

  if (!userId || !nome || !dataLimpeza) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error: perfilError } = await admin.from('perfis').insert({
    id: userId,
    nome: nome.trim(),
    data_limpeza: dataLimpeza,
  })

  if (perfilError) {
    return NextResponse.json({ error: perfilError.message }, { status: 500 })
  }

  await admin.from('streaks').insert({
    usuario_id: userId,
    streak_atual: 0,
    streak_maximo: 0,
  })

  return NextResponse.json({ ok: true })
}
