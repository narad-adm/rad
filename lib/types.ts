export interface Perfil {
  id: string
  nome: string
  data_limpeza: string
  criado_em: string
}

export interface TipoReuniao {
  id: string
  nome: string
  icone: string
  pontos: number
}

export interface CheckinReuniao {
  id: string
  usuario_id: string
  tipo_reuniao_id: string
  data: string
  hora?: string
  nota_querer?: number
  nota_beneficio?: number
  observacao?: string
  pontos_ganhos: number
  tipos_reuniao?: TipoReuniao
}

export interface SoPorHoje {
  id: string
  mes: number
  dia: number
  titulo: string
  texto: string
  reflexao?: string
}

export interface PassoPergunta {
  id: string
  passo: number
  ordem: number
  pergunta: string
  topico?: string | null
}

export const NOMES_PASSOS: Record<number, string> = {
  1:  'Primeiro Passo',
  2:  'Segundo Passo',
  3:  'Terceiro Passo',
  4:  'Quarto Passo',
  5:  'Quinto Passo',
  6:  'Sexto Passo',
  7:  'Sétimo Passo',
  8:  'Oitavo Passo',
  9:  'Nono Passo',
  10: 'Décimo Passo',
  11: 'Décimo Primeiro Passo',
  12: 'Décimo Segundo Passo',
}

export interface RespostaPasso {
  id: string
  usuario_id: string
  pergunta_id: string
  resposta: string
  criado_em: string
  passos_perguntas?: PassoPergunta
}

export interface InventarioDiario {
  id: string
  usuario_id: string
  data: string
  honestidade?: string
  admissoes?: string
  contribuicoes?: string
  doenca?: string
  acoes_limpeza?: string
  pontos_ganhos: number
}

export interface PontuacaoDiaria {
  id: string
  usuario_id: string
  data: string
  pontos_total: number
  reunioes: number
  leituras: number
  passos: number
  inventarios: number
}

export interface Streak {
  usuario_id: string
  streak_atual: number
  streak_maximo: number
  ultimo_dia_ativo?: string
}

// Sistema de pontuação
export const PONTOS = {
  REUNIAO: 30,
  REUNIAO_BONUS_RESISTENCIA: 20, // nota_querer < 5 mas foi
  LEITURA_SPJ: 20,
  RESPOSTA_PASSO: 15,
  INVENTARIO: 25,
  DIA_LIMPO: 5,
  MAXIMO_DIARIO: 100,
} as const

// Níveis de recuperação baseados na pontuação diária
export function getNivelRecuperacao(pontos: number): {
  nivel: string
  cor: string
  mensagem: string
  emoji: string
} {
  if (pontos >= 70) return {
    nivel: 'Excelente',
    cor: '#00c3ff',
    mensagem: 'Sua recuperação está em plena forma hoje!',
    emoji: '🌊',
  }
  if (pontos >= 40) return {
    nivel: 'Bom',
    cor: '#67bed9',
    mensagem: 'Você está cuidando da sua recuperação.',
    emoji: '💧',
  }
  if (pontos >= 15) return {
    nivel: 'Atenção',
    cor: '#f59e0b',
    mensagem: 'Que tal fazer mais uma atividade hoje?',
    emoji: '⚡',
  }
  return {
    nivel: 'Risco',
    cor: '#ef4444',
    mensagem: 'Sua recuperação precisa de atenção hoje.',
    emoji: '🔴',
  }
}

export function calcularDiasLimpo(dataLimpeza: string): number {
  const inicio = new Date(dataLimpeza)
  const hoje = new Date()
  const diff = hoje.getTime() - inicio.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const DIAS_SEMANA = [
  'Domingo', 'Segunda', 'Terça', 'Quarta',
  'Quinta', 'Sexta', 'Sábado'
]

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
