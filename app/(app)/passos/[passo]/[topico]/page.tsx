import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ModoFocoClient from '@/components/app/ModoFocoClient'
import { slugify } from '@/lib/utils'
import { NOMES_PASSOS } from '@/lib/types'
import { decrypt } from '@/lib/crypto'

type Params = Promise<{ passo: string; topico: string }>

export default async function ModoFocoPage({ params }: { params: Params }) {
  const { passo: passoParam, topico: topicoSlug } = await params
  const passoNum = parseInt(passoParam, 10)
  if (isNaN(passoNum) || passoNum < 1 || passoNum > 12) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all questions for this passo
  const { data: todasPerguntas } = await supabase
    .from('passos_perguntas')
    .select('id, passo, ordem, pergunta, topico')
    .eq('passo', passoNum)
    .order('ordem')

  if (!todasPerguntas?.length) notFound()

  // Find which topic this slug belongs to
  const topicosUnicos = [...new Set(todasPerguntas.map(p => p.topico ?? 'Geral'))]
  const topicoNome = topicosUnicos.find(t => slugify(t) === topicoSlug)
  if (!topicoNome) notFound()

  // Filter questions for this topic
  const perguntas = todasPerguntas.filter(p => (p.topico ?? 'Geral') === topicoNome)
  const perguntaIds = perguntas.map(p => p.id)

  // Fetch existing respostas for these questions
  const { data: respostasData } = await supabase
    .from('respostas_passos')
    .select('id, pergunta_id, resposta')
    .eq('usuario_id', user.id)
    .in('pergunta_id', perguntaIds)

  const respostasMap: Record<string, { id: string; texto: string }> = {}
  for (const r of respostasData ?? []) {
    respostasMap[r.pergunta_id] = { id: r.id, texto: decrypt(r.resposta) }
  }

  return (
    <ModoFocoClient
      passo={passoNum}
      nomePasso={NOMES_PASSOS[passoNum]}
      topicoNome={topicoNome}
      topicoSlug={topicoSlug}
      perguntas={perguntas}
      respostasIniciais={respostasMap}
      userId={user.id}
    />
  )
}
