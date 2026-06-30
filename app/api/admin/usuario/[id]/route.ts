import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = Promise<{ id: string }>

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  // Atualiza campos do perfil
  const perfilUpdates: Record<string, unknown> = {}
  if (body.nome !== undefined) perfilUpdates.nome = body.nome
  if (body.data_limpeza !== undefined) perfilUpdates.data_limpeza = body.data_limpeza
  if (body.desativado !== undefined) perfilUpdates.desativado = body.desativado

  if (Object.keys(perfilUpdates).length > 0) {
    const { error } = await supabase.from('perfis').update(perfilUpdates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Atualiza streak
  if (body.streak_atual !== undefined || body.streak_maximo !== undefined) {
    const streakUpdates: Record<string, unknown> = {}
    if (body.streak_atual !== undefined) streakUpdates.streak_atual = Number(body.streak_atual)
    if (body.streak_maximo !== undefined) streakUpdates.streak_maximo = Number(body.streak_maximo)
    const { error } = await supabase.from('streaks').update(streakUpdates).eq('usuario_id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Bane ou desbane no Supabase Auth quando o campo desativado muda
  if (body.desativado !== undefined) {
    await supabase.auth.admin.updateUserById(id, {
      ban_duration: body.desativado ? '87600h' : 'none',
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
