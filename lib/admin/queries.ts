import { createAdminClient } from '@/lib/supabase/admin'

export interface UsuarioResumo {
  id: string
  nome: string
  data_limpeza: string
  criado_em: string
  ultimo_acesso: string | null
  total_acessos: number
  email: string | null
  last_sign_in_at: string | null
  streak_atual: number
  streak_maximo: number
  total_checkins: number
  total_leituras: number
  total_respostas_passos: number
  total_inventarios: number
  total_humores: number
}

export interface MetricasModulos {
  checkins: number
  leituras: number
  respostas_passos: number
  inventarios: number
  humores: number
}

export interface AcessoPorDia {
  dia: string // YYYY-MM-DD
  total: number
}

/** Resumo agregado de todos os usuários (uma linha por usuário). */
export async function getResumoUsuarios(): Promise<UsuarioResumo[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_usuarios_resumo')
    .select('*')
    .order('ultimo_acesso', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('getResumoUsuarios:', error.message)
    return []
  }
  return (data ?? []) as UsuarioResumo[]
}

/** Resumo de um único usuário (para a página de detalhe). */
export async function getUsuarioResumo(id: string): Promise<UsuarioResumo | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_usuarios_resumo')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as UsuarioResumo
}

/** Totais globais por módulo (ranking de uso). */
export async function getMetricasModulos(): Promise<MetricasModulos> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_metricas_modulos')
    .select('*')
    .single()

  if (error || !data) {
    console.error('getMetricasModulos:', error?.message)
    return { checkins: 0, leituras: 0, respostas_passos: 0, inventarios: 0, humores: 0 }
  }
  return data as MetricasModulos
}

/** Acessos agregados por dia nos últimos N dias. */
export async function getAcessosPorDia(dias = 30): Promise<AcessoPorDia[]> {
  const supabase = createAdminClient()
  const desde = new Date()
  desde.setDate(desde.getDate() - (dias - 1))
  desde.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('acessos_log')
    .select('criado_em')
    .gte('criado_em', desde.toISOString())

  if (error) {
    console.error('getAcessosPorDia:', error.message)
    return []
  }

  // Inicializa todos os dias com 0 para um gráfico contínuo.
  const mapa = new Map<string, number>()
  for (let i = 0; i < dias; i++) {
    const d = new Date(desde)
    d.setDate(desde.getDate() + i)
    mapa.set(d.toISOString().slice(0, 10), 0)
  }
  for (const row of data ?? []) {
    const dia = new Date(row.criado_em as string).toISOString().slice(0, 10)
    if (mapa.has(dia)) mapa.set(dia, (mapa.get(dia) ?? 0) + 1)
  }

  return Array.from(mapa.entries()).map(([dia, total]) => ({ dia, total }))
}

export interface KpisGerais {
  totalUsuarios: number
  ativosHoje: number
  ativos7d: number
  ativos30d: number
  totalAcessos: number
}

/** KPIs gerais derivados do resumo de usuários. */
export function calcularKpis(usuarios: UsuarioResumo[]): KpisGerais {
  const agora = Date.now()
  const dia = 24 * 60 * 60 * 1000
  const inicioHoje = new Date()
  inicioHoje.setHours(0, 0, 0, 0)

  let ativosHoje = 0
  let ativos7d = 0
  let ativos30d = 0
  let totalAcessos = 0

  for (const u of usuarios) {
    totalAcessos += u.total_acessos ?? 0
    if (!u.ultimo_acesso) continue
    const t = new Date(u.ultimo_acesso).getTime()
    if (t >= inicioHoje.getTime()) ativosHoje++
    if (agora - t <= 7 * dia) ativos7d++
    if (agora - t <= 30 * dia) ativos30d++
  }

  return {
    totalUsuarios: usuarios.length,
    ativosHoje,
    ativos7d,
    ativos30d,
    totalAcessos,
  }
}

/** Lista de subscriptions de push para popular o seletor de notificação. */
export async function getUsuariosComPush(): Promise<Set<string>> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('push_subscriptions').select('usuario_id')
  return new Set((data ?? []).map((r) => r.usuario_id as string))
}

export interface NotificacaoEnviada {
  id: string
  titulo: string
  corpo: string
  url: string | null
  alvo: string
  alvo_nome: string | null
  total_enviado: number
  criado_em: string
}

/** Histórico de notificações disparadas pelo admin. */
export async function getHistoricoNotificacoes(limite = 30): Promise<NotificacaoEnviada[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('notificacoes_enviadas')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(limite)

  if (error) {
    console.error('getHistoricoNotificacoes:', error.message)
    return []
  }
  return (data ?? []) as NotificacaoEnviada[]
}
