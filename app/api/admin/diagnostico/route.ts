import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'sperancin.ads@gmail.com'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('usuario_id, endpoint, atualizado_em')

  return NextResponse.json({ total: data?.length ?? 0, error: error?.message, subs: data })
}
