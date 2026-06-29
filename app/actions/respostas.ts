'use server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { atualizarStreak } from './streak'

export async function inserirRespostaPasso(perguntaId: string, texto: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('respostas_passos')
    .insert({
      usuario_id: user.id,
      pergunta_id: perguntaId,
      resposta: encrypt(texto),
      pontos_ganhos: 15,
    })
    .select('*, passos_perguntas(*)')
    .single()

  if (error) throw error
  await atualizarStreak()
  return { ...data, resposta: texto }
}

export async function atualizarRespostaPasso(id: string, texto: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('respostas_passos')
    .update({ resposta: encrypt(texto) })
    .eq('id', id)

  if (error) throw error
}
