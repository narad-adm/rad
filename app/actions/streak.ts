'use server'
import { createClient } from '@/lib/supabase/server'
import { hojeEmBRT } from '@/lib/utils'

export async function atualizarStreak(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const hoje = hojeEmBRT()
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  const ontemStr = ontem.toISOString().split('T')[0]

  const { data } = await supabase
    .from('streaks')
    .select('*')
    .eq('usuario_id', user.id)
    .single()

  if (!data) return

  // Já contou hoje — não incrementa
  if (data.ultimo_dia_ativo === hoje) return

  const novoStreak = data.ultimo_dia_ativo === ontemStr ? data.streak_atual + 1 : 1

  await supabase.from('streaks').update({
    streak_atual: novoStreak,
    streak_maximo: Math.max(novoStreak, data.streak_maximo),
    ultimo_dia_ativo: hoje,
    atualizado_em: new Date().toISOString(),
  }).eq('usuario_id', user.id)
}
