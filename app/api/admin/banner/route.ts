import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('banners_globais')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { mensagem, tipo } = await req.json()
  if (!mensagem?.trim()) {
    return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Desativa todos os banners anteriores (só um ativo por vez)
  await supabase.from('banners_globais').update({ ativo: false }).eq('ativo', true)

  const { data, error } = await supabase
    .from('banners_globais')
    .insert({ mensagem: mensagem.trim(), tipo: tipo ?? 'info', ativo: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
