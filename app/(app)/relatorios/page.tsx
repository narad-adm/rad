import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RelatoriosClient from '@/components/app/RelatoriosClient'
import { calcularDiasLimpo } from '@/lib/types'

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [perfil, pontuacoes, streak, checkins, leituras, respostas, inventarios] = await Promise.all([
    supabase.from('perfis').select('*').eq('id', user.id).single(),
    supabase.from('pontuacao_diaria').select('*')
      .eq('usuario_id', user.id).order('data', { ascending: false }).limit(30),
    supabase.from('streaks').select('*').eq('usuario_id', user.id).single(),
    supabase.from('checkins_reuniao').select('*, tipos_reuniao(nome)')
      .eq('usuario_id', user.id).order('criado_em', { ascending: false }).limit(20),
    supabase.from('leituras_spj').select('data')
      .eq('usuario_id', user.id).order('data', { ascending: false }).limit(30),
    supabase.from('respostas_passos').select('id, criado_em')
      .eq('usuario_id', user.id),
    supabase.from('inventarios_diarios').select('data')
      .eq('usuario_id', user.id).order('data', { ascending: false }).limit(30),
  ])

  const diasLimpo = perfil.data ? calcularDiasLimpo(perfil.data.data_limpeza) : 0

  return (
    <RelatoriosClient
      diasLimpo={diasLimpo}
      streak={streak.data?.streak_atual ?? 0}
      streakMax={streak.data?.streak_maximo ?? 0}
      pontuacoes={pontuacoes.data ?? []}
      checkins={checkins.data ?? []}
      totalLeituras={leituras.data?.length ?? 0}
      totalRespostas={respostas.data?.length ?? 0}
      totalInventarios={inventarios.data?.length ?? 0}
    />
  )
}
