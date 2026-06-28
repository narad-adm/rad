'use client'
import { useState } from 'react'
import { Fire, Trophy, UsersFour, BookOpenText, ClipboardText, ChatCircleText, ChartBar, CaretLeft, CaretRight, X, MagnifyingGlass, HandsPraying, Heart, Warning, Sparkle } from '@phosphor-icons/react'
import { getHumor } from '@/lib/humores'
import { hojeEmBRT } from '@/lib/utils'
import { buscarDadosCalendario, buscarInventarioPorData } from '@/app/actions/inventario'

const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const PERGUNTAS_INVENTARIO = [
  { key: 'honestidade',   titulo: 'Honestidade',       Icon: MagnifyingGlass, cor: 'var(--duo-blue)'   },
  { key: 'admissoes',     titulo: 'Admissões',          Icon: HandsPraying,    cor: 'var(--duo-purple)' },
  { key: 'contribuicoes', titulo: 'Contribuições',      Icon: Heart,           cor: 'var(--duo-pink)'   },
  { key: 'doenca',        titulo: 'Minha doença',       Icon: Warning,         cor: 'var(--duo-orange)' },
  { key: 'acoes_limpeza', titulo: 'Minha recuperação',  Icon: Sparkle,         cor: 'var(--duo-green)'  },
] as const

interface InventarioAberto {
  data: string
  respostas: Record<string, string>
}

interface Props {
  diasLimpo: number
  streak: number
  streakMax: number
  pontuacoes: any[]
  checkins: any[]
  totalLeituras: number
  totalRespostas: number
  totalInventarios: number
  humoresMes: { data: string; humor: string }[]
  diasComInventario: string[]
  anoMes: { ano: number; mes: number }
}

export default function RelatoriosClient({
  diasLimpo, streak, streakMax, pontuacoes, checkins,
  totalLeituras, totalRespostas, totalInventarios,
  humoresMes, diasComInventario, anoMes,
}: Props) {
  const totalPontos = pontuacoes.reduce((acc, p) => acc + p.pontos_total, 0)
  const totalReunioes = checkins.length
  const mediaPontos = pontuacoes.length > 0 ? Math.round(totalPontos / pontuacoes.length) : 0

  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const str = d.toISOString().split('T')[0]
    const pont = pontuacoes.find(p => p.data === str)
    return {
      dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3),
      pontos: pont?.pontos_total ?? 0,
      data: str,
    }
  })

  const hoje = hojeEmBRT()
  const maxVal = Math.max(...ultimos7.map(d => d.pontos), 100)

  // ── Calendário state ───────────────────────────────
  const [calAno, setCalAno] = useState(anoMes.ano)
  const [calMes, setCalMes] = useState(anoMes.mes)
  const [calHumores, setCalHumores] = useState<{ data: string; humor: string }[]>(humoresMes)
  const [calInventarios, setCalInventarios] = useState<Set<string>>(new Set(diasComInventario))
  const [calLoading, setCalLoading] = useState(false)

  // ── Bottom sheet state ─────────────────────────────
  const [inventarioAberto, setInventarioAberto] = useState<InventarioAberto | null>(null)
  const [inventarioLoading, setInventarioLoading] = useState(false)

  async function navegarMes(delta: number) {
    let novoMes = calMes + delta
    let novoAno = calAno
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    if (novoMes > 11) { novoMes = 0; novoAno++ }

    // Não navegar para o futuro
    const agora = new Date()
    if (novoAno > agora.getFullYear() || (novoAno === agora.getFullYear() && novoMes > agora.getMonth())) return

    setCalLoading(true)
    const dados = await buscarDadosCalendario(novoAno, novoMes)
    setCalAno(novoAno)
    setCalMes(novoMes)
    setCalHumores(dados.humores)
    setCalInventarios(new Set(dados.diasComInventario))
    setCalLoading(false)
  }

  async function handleDiaClick(dataStr: string) {
    if (!calInventarios.has(dataStr)) return
    setInventarioLoading(true)
    setInventarioAberto({ data: dataStr, respostas: {} })
    const inv = await buscarInventarioPorData(dataStr)
    if (inv) {
      setInventarioAberto({ data: dataStr, respostas: inv as any })
    }
    setInventarioLoading(false)
  }

  const humorMap: Record<string, string> = {}
  for (const h of calHumores) humorMap[h.data] = h.humor

  const humoresRegistrados = [...new Set(calHumores.map(h => h.humor))]
    .map(k => getHumor(k)).filter(Boolean)

  const primeiroDia = new Date(calAno, calMes, 1).getDay()
  const totalDias = new Date(calAno, calMes + 1, 0).getDate()

  const agora = new Date()
  const ehMesAtual = calAno === agora.getFullYear() && calMes === agora.getMonth()

  const stats = [
    { Icon: Fire,          label: 'Dias seguidos',   valor: streak,          cor: 'var(--duo-orange)' },
    { Icon: Trophy,        label: 'Recorde pessoal',  valor: streakMax,       cor: '#d97706'           },
    { Icon: UsersFour,     label: 'Reuniões',         valor: totalReunioes,   cor: 'var(--duo-blue)'   },
    { Icon: BookOpenText,  label: 'Leituras SPJ',     valor: totalLeituras,   cor: '#7d88e6'           },
    { Icon: ClipboardText, label: 'Inventários',      valor: totalInventarios,cor: '#8a81e5'           },
    { Icon: ChatCircleText,label: 'Resp. do Guia',    valor: totalRespostas,  cor: '#22c55e'           },
  ]

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>Meu Histórico</h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 700, marginTop: 2 }}>
          {MESES_PT[anoMes.mes]} {anoMes.ano}
        </p>
      </div>

      {/* ── Card unificado de estatísticas ─────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        overflow: 'hidden',
      }}>
        {stats.map(({ Icon, label, valor, cor }, idx) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1.125rem',
              borderBottom: idx < stats.length - 1 ? '1.5px solid var(--border)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${cor}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cor,
              }}>
                <Icon size={18} weight="duotone" />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-2)' }}>{label}</span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-1)' }}>{valor}</span>
          </div>
        ))}
      </div>

      {/* ── Calendário ────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        padding: '1.25rem',
        boxShadow: '0 4px 0 var(--border)',
        opacity: calLoading ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}>
        {/* Cabeçalho do calendário */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={() => navegarMes(-1)}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
              background: 'var(--bg-card-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)',
            }}
          >
            <CaretLeft size={14} weight="bold" />
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)', lineHeight: 1.2 }}>
              {MESES_PT[calMes]}
            </p>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)' }}>{calAno}</p>
          </div>

          <button
            onClick={() => navegarMes(1)}
            disabled={ehMesAtual}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)',
              background: 'var(--bg-card-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              cursor: ehMesAtual ? 'default' : 'pointer',
              color: ehMesAtual ? 'var(--border)' : 'var(--text-2)',
            }}
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>

        {/* Dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: '0.5rem' }}>
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-3)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: primeiroDia }).map((_, i) => <div key={`off-${i}`} />)}

          {Array.from({ length: totalDias }, (_, i) => {
            const numDia = i + 1
            const dataStr = `${calAno}-${String(calMes + 1).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`
            const humor = humorMap[dataStr] ? getHumor(humorMap[dataStr]) : null
            const temInventario = calInventarios.has(dataStr)
            const isHoje = dataStr === hoje
            const isFuturo = dataStr > hoje
            const clicavel = temInventario && !isFuturo

            let bg = 'var(--bg-card-2)'
            let border = '1px solid var(--border)'
            let content: React.ReactNode = (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', opacity: isFuturo ? 0.3 : 1 }}>
                {numDia}
              </span>
            )

            if (humor) {
              bg = humor.corFundo
              border = `1.5px solid ${humor.corBorda}`
              if (isHoje) border = `2px solid var(--duo-blue)`
              content = <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{humor.emoji}</span>
            } else if (isHoje) {
              bg = 'rgba(0,157,255,0.08)'
              border = '2px dashed var(--duo-blue)'
              content = <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--duo-blue)' }}>{numDia}</span>
            } else if (isFuturo) {
              bg = 'transparent'
              border = 'none'
            }

            return (
              <div
                key={dataStr}
                onClick={() => clicavel && handleDiaClick(dataStr)}
                title={humor ? `${humor.label} · ${numDia}/${calMes + 1}` : undefined}
                style={{
                  aspectRatio: '1', borderRadius: 8,
                  background: bg, border,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                  cursor: clicavel ? 'pointer' : 'default',
                  position: 'relative',
                }}
              >
                {content}
                {temInventario && !isFuturo && (
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#8a81e5',
                    position: 'absolute', bottom: 3,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div style={{ marginTop: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {humoresRegistrados.length > 0 && (
            <>
              <p style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                HUMORES REGISTRADOS
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                {humoresRegistrados.map(h => h && (
                  <div key={h.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1rem' }}>{h.emoji}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)' }}>{h.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {calInventarios.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8a81e5', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)' }}>
                Toque num dia com ponto roxo para ver seu inventário
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Gráfico últimos 7 dias ─────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        padding: '1.25rem',
        boxShadow: '0 4px 0 var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChartBar size={18} weight="duotone" color="var(--duo-blue)" />
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)' }}>Últimos 7 dias</p>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 700 }}>média {mediaPontos} pts/dia</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: `${(1 - 70 / maxVal) * 90}px`,
            left: 0, right: 0,
            borderTop: '2px dashed var(--duo-blue)',
            opacity: 0.4, zIndex: 1,
          }}>
            <span style={{
              position: 'absolute', right: 0,
              fontSize: '0.58rem', fontWeight: 800,
              color: 'var(--duo-blue)',
              transform: 'translateY(-100%)',
            }}>meta</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
            {ultimos7.map(({ dia, pontos, data }) => {
              const isHoje = data === hoje
              const altura = pontos > 0 ? Math.max(8, (pontos / maxVal) * 90) : 8
              const barBg = pontos === 0 ? 'var(--bg-card-2)'
                : isHoje ? 'var(--duo-blue)'
                : pontos >= 70 ? 'var(--duo-blue)'
                : pontos >= 40 ? 'rgba(0,157,255,0.5)'
                : 'rgba(0,157,255,0.25)'
              return (
                <div key={data} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: pontos >= 70 ? 'var(--duo-blue)' : 'var(--text-3)', minHeight: 14, display: 'block', textAlign: 'center' }}>
                    {pontos > 0 ? pontos : ''}
                  </span>
                  <div style={{
                    width: '100%', height: altura, background: barBg, borderRadius: 10,
                    border: pontos === 0 ? '1.5px dashed var(--border)' : 'none',
                    boxShadow: isHoje ? '0 4px 12px rgba(0,157,255,0.3)' : 'none',
                  }} />
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {ultimos7.map(({ dia, data }) => (
              <div key={data} style={{
                flex: 1, textAlign: 'center',
                fontSize: '0.65rem', fontWeight: data === hoje ? 800 : 600,
                color: data === hoje ? 'var(--duo-blue)' : 'var(--text-3)',
                textTransform: 'capitalize',
              }}>
                {dia}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Últimas reuniões ───────────────────────────── */}
      {checkins.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '2.5px solid var(--border)',
          borderRadius: 20,
          padding: '1.25rem',
          boxShadow: '0 4px 0 var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
            <UsersFour size={18} weight="duotone" color="var(--duo-blue)" />
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)' }}>Últimas reuniões</p>
          </div>
          <div>
            {checkins.slice(0, 5).map((c: any, idx: number) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: idx > 0 ? '0.75rem' : 0,
                borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                marginTop: idx > 0 ? '0.75rem' : 0,
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
                    {c.tipos_reuniao?.nome ?? 'Reunião'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>
                    {new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    {c.nota_beneficio != null && ` · benefício ${c.nota_beneficio}/10`}
                  </div>
                </div>
                <span style={{
                  background: 'var(--duo-blue-bg)', color: 'var(--duo-blue)',
                  border: '1.5px solid var(--duo-blue)',
                  borderRadius: 99, padding: '2px 8px',
                  fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap',
                }}>
                  +{c.pontos_ganhos}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom sheet: inventário ───────────────────── */}
      {inventarioAberto && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setInventarioAberto(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            zIndex: 201,
            background: 'var(--bg-card)',
            borderRadius: '20px 20px 0 0',
            border: '2px solid var(--border)',
            borderBottom: 'none',
            maxHeight: '80dvh',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Handle + Header */}
            <div style={{ padding: '0.75rem 1.25rem 0', flexShrink: 0 }}>
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'var(--border)', margin: '0 auto 1rem',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-1)' }}>Inventário</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>
                    {new Date(inventarioAberto.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setInventarioAberto(null)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-card-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-2)',
                  }}
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
            </div>

            {/* Conteúdo */}
            <div style={{ overflowY: 'auto', padding: '1rem 1.25rem 2rem', flex: 1 }}>
              {inventarioLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-3)', fontSize: '0.875rem', fontWeight: 700 }}>
                  Carregando...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {PERGUNTAS_INVENTARIO.map(({ key, titulo, Icon, cor }) => {
                    const texto = (inventarioAberto.respostas as any)[key] ?? ''
                    if (!texto) return null
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.375rem' }}>
                          <Icon size={14} weight="duotone" color={cor} />
                          <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {titulo}
                          </p>
                        </div>
                        <p style={{
                          fontSize: '0.875rem', color: 'var(--text-1)', lineHeight: 1.65,
                          background: 'var(--bg-card-2)', borderRadius: 12,
                          padding: '0.75rem', border: '1px solid var(--border)',
                        }}>
                          {texto}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
