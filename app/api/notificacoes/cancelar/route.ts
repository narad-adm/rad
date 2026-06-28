import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { endpoint } = body

  if (endpoint) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  } else {
    await supabase.from('push_subscriptions').delete().eq('usuario_id', user.id)
  }

  return NextResponse.json({ ok: true })
}
