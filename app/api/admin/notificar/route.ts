import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Dispara uma notificação push a partir do painel admin.
 * Autenticado pela sessão do admin (não pelo CRON_SECRET).
 * Reusa a mesma mecânica de web-push da rota de cron existente.
 */
export async function POST(req: NextRequest) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  webpush.setVapidDetails(
    'mailto:sperancin.ads@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  const { titulo, corpo, url, usuario_id } = await req.json()
  if (!titulo?.trim() || !corpo?.trim()) {
    return NextResponse.json({ error: 'Título e conteúdo são obrigatórios.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  let query = supabase.from('push_subscriptions').select('*')
  if (usuario_id) query = query.eq('usuario_id', usuario_id)
  const { data: subs } = await query

  const payload = JSON.stringify({
    title: titulo,
    body: corpo,
    url: url ?? '/',
  })

  let sent = 0
  const stale: string[] = []

  await Promise.allSettled(
    (subs ?? []).map(async (sub) => {
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
    }),
  )

  if (stale.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', stale)
  }

  // Nome legível do alvo para o histórico.
  let alvoNome = 'Todos os usuários'
  if (usuario_id) {
    const { data: perfil } = await supabase
      .from('perfis').select('nome').eq('id', usuario_id).single()
    alvoNome = perfil?.nome ?? 'Usuário específico'
  }

  await supabase.from('notificacoes_enviadas').insert({
    titulo,
    corpo,
    url: url ?? null,
    alvo: usuario_id ?? 'todos',
    alvo_nome: alvoNome,
    total_enviado: sent,
  })

  return NextResponse.json({ sent, stale: stale.length })
}
