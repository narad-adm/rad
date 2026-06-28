import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calcularDiasLimpo, getNivelRecuperacao, PONTOS } from '@/lib/types'
import { hojeEmBRT } from '@/lib/utils'
import DashboardClient from '@/components/app/DashboardClient'

async function getDadosDashboard(userId: string) {
  const supabase = await createClient()
  const hoje = hojeEmBRT()

  const [perfil, pontuacao, streak, checkins, leitura, inventario, humor] = await Promise.all([
    supabase.from('perfis').select('*').eq('id', userId).single(),
    supabase.from('pontuacao_diaria').select('*').eq('usuario_id', userId).eq('data', hoje).single(),
    supabase.from('streaks').select('*').eq('usuario_id', userId).single(),
    supabase.from('checkins_reuniao').select('id').eq('usuario_id', userId).eq('data', hoje),
    supabase.from('leituras_spj').select('id').eq('usuario_id', userId).eq('data', hoje).single(),
    supabase.from('inventarios_diarios').select('id').eq('usuario_id', userId).eq('data', hoje).single(),
    supabase.from('humores_diarios').select('humor').eq('usuario_id', userId).eq('data', hoje).single(),
  ])

  return {
    perfil: perfil.data,
    onboardingConcluido: perfil.data?.onboarding_concluido ?? true,
    pontuacaoHoje: pontuacao.data?.pontos_total ?? 0,
    streak: streak.data?.streak_atual ?? 0,
    streakMax: streak.data?.streak_maximo ?? 0,
    reunioesHoje: checkins.data?.length ?? 0,
    leuHoje: !!leitura.data,
    inventarioHoje: !!inventario.data,
    jaRespondeuHoje: !!humor.data,
    humorHoje: humor.data?.humor ?? null,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dados = await getDadosDashboard(user.id)
  if (!dados.perfil) redirect('/login')

  const diasLimpo = calcularDiasLimpo(dados.perfil.data_limpeza)
  const nivel = getNivelRecuperacao(dados.pontuacaoHoje)
  const porcentagem = Math.min(100, (dados.pontuacaoHoje / PONTOS.MAXIMO_DIARIO) * 100)

  return (
    <DashboardClient
      nome={dados.perfil.nome}
      diasLimpo={diasLimpo}
      dataLimpeza={dados.perfil.data_limpeza}
      pontuacaoHoje={dados.pontuacaoHoje}
      porcentagem={porcentagem}
      nivel={nivel}
      streak={dados.streak}
      streakMax={dados.streakMax}
      reunioesHoje={dados.reunioesHoje}
      leuHoje={dados.leuHoje}
      inventarioHoje={dados.inventarioHoje}
      jaRespondeuHoje={dados.jaRespondeuHoje}
      humorHoje={dados.humorHoje}
      userId={user.id}
      onboardingConcluido={dados.onboardingConcluido}
    />
  )
}
