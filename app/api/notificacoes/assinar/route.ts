import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await req.json()

  await supabase.from('push_subscriptions').upsert({
    usuario_id: user.id,
    endpoint: sub.endpoint,
    p256dh: sub.keys?.p256dh,
    auth: sub.keys?.auth,
    atualizado_em: new Date().toISOString(),
  }, { onConflict: 'endpoint' })

  return NextResponse.json({ ok: true })
}
