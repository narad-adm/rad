import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RankingOptIn from '@/components/app/RankingOptIn'
import RankingRecusado from '@/components/app/RankingRecusado'
import RankingLista from '@/components/app/RankingLista'

function getSemanaAtual() {
  const hoje = new Date()
  const diaSemana = hoje.getDay() // 0=dom, 1=seg...
  const diasAteSeg = diaSemana === 0 ? -6 : 1 - diaSemana
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() + diasAteSeg)
  const fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  return { inicioSemana: fmt(inicio), fimSemana: fmt(fim) }
}

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('ranking_opt_in')
    .eq('id', user.id)
    .single()

  if (!perfil) redirect('/login')

  const optIn: boolean | null = perfil.ranking_opt_in ?? null

  if (optIn === null) {
    return <RankingOptIn userId={user.id} />
  }

  if (optIn === false) {
    return <RankingRecusado userId={user.id} />
  }

  const { data: ranking } = await supabase
    .from('ranking_semanal')
    .select('*')
    .order('posicao', { ascending: true })

  const { inicioSemana, fimSemana } = getSemanaAtual()

  return (
    <RankingLista
      ranking={ranking ?? []}
      usuarioId={user.id}
      inicioSemana={inicioSemana}
      fimSemana={fimSemana}
    />
  )
}
