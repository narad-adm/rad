import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:sperancin.ads@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  // Validate internal secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { titulo, corpo, url, usuario_id } = await req.json()

  const supabase = await createClient()

  let query = supabase.from('push_subscriptions').select('*')
  if (usuario_id) query = query.eq('usuario_id', usuario_id)

  const { data: subs } = await query

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({
    title: titulo ?? 'RAD',
    body: corpo ?? 'Você tem atividades pendentes hoje.',
    url: url ?? '/',
  })

  let sent = 0
  const stale: string[] = []

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) stale.push(sub.endpoint)
      }
    })
  )

  if (stale.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', stale)
  }

  return NextResponse.json({ sent, stale: stale.length })
}
