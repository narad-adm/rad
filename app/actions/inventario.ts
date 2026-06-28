'use server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

type CamposInventario = {
  honestidade: string
  admissoes: string
  contribuicoes: string
  doenca: string
  acoes_limpeza: string
}

export async function buscarInventarioHoje(): Promise<(CamposInventario & { id: string }) | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const hoje = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('inventarios_diarios')
    .select('id, honestidade, admissoes, contribuicoes, doenca, acoes_limpeza')
    .eq('usuario_id', user.id)
    .eq('data', hoje)
    .single()

  if (!data) return null
  return {
    id: data.id,
    honestidade:   data.honestidade   ? decrypt(data.honestidade)   : '',
    admissoes:     data.admissoes     ? decrypt(data.admissoes)     : '',
    contribuicoes: data.contribuicoes ? decrypt(data.contribuicoes) : '',
    doenca:        data.doenca        ? decrypt(data.doenca)        : '',
    acoes_limpeza: data.acoes_limpeza ? decrypt(data.acoes_limpeza) : '',
  }
}

export async function buscarDadosCalendario(ano: number, mes: number): Promise<{
  humores: { data: string; humor: string }[]
  diasComInventario: string[]
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { humores: [], diasComInventario: [] }

  const pad = (n: number) => String(n).padStart(2, '0')
  const inicioMes = `${ano}-${pad(mes + 1)}-01`
  const ultimoDia = new Date(ano, mes + 1, 0).getDate()
  const fimMes = `${ano}-${pad(mes + 1)}-${pad(ultimoDia)}`

  const [humoresRes, inventariosRes] = await Promise.all([
    supabase.from('humores_diarios').select('data, humor')
      .eq('usuario_id', user.id).gte('data', inicioMes).lte('data', fimMes),
    supabase.from('inventarios_diarios').select('data')
      .eq('usuario_id', user.id).gte('data', inicioMes).lte('data', fimMes),
  ])

  return {
    humores: humoresRes.data ?? [],
    diasComInventario: (inventariosRes.data ?? []).map(i => i.data),
  }
}

export async function buscarInventarioPorData(data: string): Promise<(CamposInventario & { id: string }) | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: inv } = await supabase
    .from('inventarios_diarios')
    .select('id, honestidade, admissoes, contribuicoes, doenca, acoes_limpeza')
    .eq('usuario_id', user.id)
    .eq('data', data)
    .single()

  if (!inv) return null
  return {
    id: inv.id,
    honestidade:   inv.honestidade   ? decrypt(inv.honestidade)   : '',
    admissoes:     inv.admissoes     ? decrypt(inv.admissoes)     : '',
    contribuicoes: inv.contribuicoes ? decrypt(inv.contribuicoes) : '',
    doenca:        inv.doenca        ? decrypt(inv.doenca)        : '',
    acoes_limpeza: inv.acoes_limpeza ? decrypt(inv.acoes_limpeza) : '',
  }
}

export async function salvarInventario(respostas: CamposInventario): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const hoje = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('inventarios_diarios').insert({
    usuario_id: user.id,
    data: hoje,
    honestidade:   encrypt(respostas.honestidade),
    admissoes:     encrypt(respostas.admissoes),
    contribuicoes: encrypt(respostas.contribuicoes),
    doenca:        encrypt(respostas.doenca),
    acoes_limpeza: encrypt(respostas.acoes_limpeza),
    pontos_ganhos: 25,
  })

  if (error) throw error

  const { data } = await supabase
    .from('pontuacao_diaria')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('data', hoje)
    .single()

  if (data) {
    await supabase.from('pontuacao_diaria').update({
      pontos_total: Math.min(100, data.pontos_total + 25),
      inventarios: data.inventarios + 1,
      atualizado_em: new Date().toISOString(),
    }).eq('id', data.id)
  } else {
    await supabase.from('pontuacao_diaria').insert({
      usuario_id: user.id, data: hoje, pontos_total: 25, inventarios: 1,
    })
  }
}
