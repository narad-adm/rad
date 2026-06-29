import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Registra um acesso do usuário autenticado. Chamado de forma
 * fire-and-forget pelo app no carregamento (com throttle no client).
 * Falha silenciosamente — nunca deve impactar a UX.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })

    await supabase.rpc('registrar_acesso', { uid: user.id })
    return NextResponse.json({ ok: true })
  } catch {
    // Função/coluna ainda não migrada, etc. — não quebra o app.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
