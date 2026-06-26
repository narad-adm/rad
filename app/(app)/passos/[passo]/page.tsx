import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PassosTopicoListaClient from '@/components/app/PassosTopicoListaClient'
import { slugify } from '@/lib/utils'

type Params = Promise<{ passo: string }>

export default async function PassoPage({ params }: { params: Params }) {
  const { passo: passoParam } = await params
  const passoNum = parseInt(passoParam, 10)
  if (isNaN(passoNum) || passoNum < 1 || passoNum > 12) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [perguntasData, respostasData] = await Promise.all([
    supabase.from('passos_perguntas')
      .select('id, topico, ordem')
      .eq('passo', passoNum)
      .order('ordem'),
    supabase.from('respostas_passos')
      .select('pergunta_id')
      .eq('usuario_id', user.id),
  ])

  const perguntas = perguntasData.data ?? []
  const respondidas = new Set((respostasData.data ?? []).map(r => r.pergunta_id))

  // Group by topico
  const topicosMap = new Map<string, { total: number; feitas: number }>()
  for (const p of perguntas) {
    const topico = p.topico ?? 'Geral'
    const entry = topicosMap.get(topico) ?? { total: 0, feitas: 0 }
    entry.total++
    if (respondidas.has(p.id)) entry.feitas++
    topicosMap.set(topico, entry)
  }

  const topicos = Array.from(topicosMap.entries()).map(([nome, stats]) => ({
    nome,
    slug: slugify(nome),
    total: stats.total,
    feitas: stats.feitas,
  }))

  const totalPerguntas = perguntas.length
  const totalFeitas = perguntas.filter(p => respondidas.has(p.id)).length

  return (
    <PassosTopicoListaClient
      passo={passoNum}
      topicos={topicos}
      totalPerguntas={totalPerguntas}
      totalFeitas={totalFeitas}
    />
  )
}
