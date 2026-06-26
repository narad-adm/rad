import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PassosClient from '@/components/app/PassosClient'

export default async function PassosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [perguntasData, respostasData] = await Promise.all([
    supabase.from('passos_perguntas').select('*').order('passo').order('ordem'),
    supabase.from('respostas_passos')
      .select('*, passos_perguntas(*)')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false }),
  ])

  return (
    <PassosClient
      perguntas={perguntasData.data ?? []}
      respostas={respostasData.data ?? []}
      userId={user.id}
    />
  )
}
