import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PassosListaClient from '@/components/app/PassosListaClient'

export default async function PassosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [perguntasData, respostasData] = await Promise.all([
    supabase.from('passos_perguntas').select('id, passo'),
    supabase.from('respostas_passos')
      .select('pergunta_id, pontos_ganhos')
      .eq('usuario_id', user.id),
  ])

  const perguntas = perguntasData.data ?? []
  const respostas = respostasData.data ?? []

  const respondidas = new Set(respostas.map(r => r.pergunta_id))
  const totalPontosGanhos = respostas.reduce((acc, r) => acc + (r.pontos_ganhos ?? 0), 0)

  const statsPorPasso = Array.from({ length: 12 }, (_, i) => {
    const passo = i + 1
    const pergsDoPasso = perguntas.filter(p => p.passo === passo)
    const total = pergsDoPasso.length
    const feitas = pergsDoPasso.filter(p => respondidas.has(p.id)).length
    return { passo, total, feitas }
  })

  const totalRespondidas = respondidas.size
  const passosIniciados = statsPorPasso.filter(s => s.feitas > 0).length

  return (
    <PassosListaClient
      statsPorPasso={statsPorPasso}
      totalRespondidas={totalRespondidas}
      totalPontosGanhos={totalPontosGanhos}
      passosIniciados={passosIniciados}
    />
  )
}
