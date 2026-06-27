'use client'
import { Fire, Trophy, UsersFour, BookOpenText, ClipboardText, ChatCircleText, Leaf } from '@phosphor-icons/react'
import { HUMORES, getHumor } from '@/lib/humores'

const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

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
  anoMes: { ano: number; mes: number }
}

export default function RelatoriosClient({
  diasLimpo, streak, streakMax, pontuacoes, checkins,
  totalLeituras, totalRespostas, totalInventarios,
  humoresMes, anoMes,
}: Props) {
  const totalPontos = pontuacoes.reduce((acc, p) => acc + p.pontos_total, 0)
  const totalReunioes = checkins.length
  const mediaPontos = pontuacoes.length > 0 ? Math.round(totalPontos / pontuacoes.length) : 0

  const anos  = Math.floor(diasLimpo / 365)
  const meses = Math.floor((diasLimpo % 365) / 30)
  const dias  = diasLimpo % 30

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

  const hoje = new Date().toISOString().split('T')[0]
  const maxVal = Math.max(...ultimos7.map(d => d.pontos), 100)

  // Calendário de humor
  const { ano, mes } = anoMes
  const primeiroDia = new Date(ano, mes, 1).getDay() // 0=Dom
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  const humorMap: Record<string, string> = {}
  for (const h of humoresMes) humorMap[h.data] = h.humor

  // Humores únicos registrados no mês
  const humoresRegistrados = [...new Set(humoresMes.map(h => h.humor))]
    .map(k => getHumor(k)).filter(Boolean)

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>Meu Histórico</h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 700, marginTop: 2 }}>
          {MESES_PT[mes]} {ano}
        </p>
      </div>

      {/* ── Hero — Tempo Limpo ─────────────────────────── */}
      <div style={{
        background: 'var(--duo-blue)',
        borderRadius: 20,
        padding: '1.5rem',
        border: '2.5px solid var(--duo-blue)',
        boxShadow: '0 4px 0 #0d86c0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
          <Leaf size={16} weight="duotone" color="rgba(255,255,255,0.7)" />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.1em' }}>
            TEMPO LIMPO
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {anos > 0 && <MiniCard valor={anos} label="anos" />}
          {(anos > 0 || meses > 0) && <MiniCard valor={meses} label="meses" />}
          <MiniCard valor={dias} label="dias" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.875rem' }}>
          💙 Só por hoje
        </p>
      </div>

      {/* ── Streak e Recorde ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: 'var(--bg-card)',
          border: `2.5px solid ${streak > 0 ? 'rgba(255,150,0,0.4)' : 'var(--border)'}`,
          borderRadius: 20, padding: '1.25rem', textAlign: 'center',
          boxShadow: `0 4px 0 ${streak > 0 ? 'rgba(255,150,0,0.25)' : 'var(--border)'}`,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🔥</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: streak > 0 ? 'var(--duo-orange)' : 'var(--text-3)', lineHeight: 1 }}>
            {streak}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.3rem', fontWeight: 700 }}>dias seguidos</div>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '2.5px solid rgba(234,179,8,0.4)',
          borderRadius: 20, padding: '1.25rem', textAlign: 'center',
          boxShadow: '0 4px 0 rgba(234,179,8,0.2)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🏆</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{streakMax}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.3rem', fontWeight: 700 }}>recorde pessoal</div>
        </div>
      </div>

      {/* ── Calendário de humor ────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        padding: '1.25rem',
        boxShadow: '0 4px 0 var(--border)',
      }}>
        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1rem' }}>
          😊 Seu humor esse mês
        </p>

        {/* Header dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: '0.5rem' }}>
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-3)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Células */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {/* Offset */}
          {Array.from({ length: primeiroDia }).map((_, i) => (
            <div key={`off-${i}`} />
          ))}

          {/* Dias */}
          {Array.from({ length: totalDias }, (_, i) => {
            const numDia = i + 1
            const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`
            const humor = humorMap[dataStr] ? getHumor(humorMap[dataStr]) : null
            const isHoje = dataStr === hoje
            const isFuturo = dataStr > hoje

            let bg = 'var(--bg-card-2)'
            let border = '1px solid var(--border)'
            let content: React.ReactNode = (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isFuturo ? 'var(--text-3)' : 'var(--text-3)', opacity: isFuturo ? 0.3 : 1 }}>
                {numDia}
              </span>
            )

            if (humor) {
              bg = humor.corFundo
              border = `1.5px solid ${humor.corBorda}`
              content = <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{humor.emoji}</span>
            } else if (isHoje) {
              bg = 'rgba(0,157,255,0.08)'
              border = '2px dashed var(--duo-blue)'
              content = <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--duo-blue)' }}>{numDia}</span>
            } else if (isFuturo) {
              bg = 'transparent'
              border = 'none'
            }

            if (isHoje && humor) {
              border = `2px solid var(--duo-blue)`
            }

            return (
              <div
                key={dataStr}
                title={humor ? `${humor.label} · ${numDia}/${mes + 1}` : undefined}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: bg,
                  border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {content}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        {humoresRegistrados.length > 0 && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
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
          </div>
        )}
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
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)' }}>📈 Últimos 7 dias</p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 700 }}>média {mediaPontos} pts/dia</span>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Linha meta 70pts */}
          <div style={{
            position: 'absolute',
            top: `${(1 - 70 / maxVal) * 90}px`,
            left: 0, right: 0,
            borderTop: '2px dashed var(--duo-blue)',
            opacity: 0.4,
            zIndex: 1,
          }}>
            <span style={{
              position: 'absolute', right: 0,
              fontSize: '0.58rem', fontWeight: 800,
              color: 'var(--duo-blue)',
              transform: 'translateY(-100%)',
              paddingRight: 2,
            }}>meta</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
            {ultimos7.map(({ dia, pontos, data }) => {
              const isHoje = data === hoje
              const altura = pontos > 0 ? Math.max(8, (pontos / maxVal) * 90) : 8
              const barBg = pontos === 0
                ? 'var(--bg-card-2)'
                : isHoje
                  ? 'var(--duo-blue)'
                  : pontos >= 70
                    ? 'var(--duo-blue)'
                    : pontos >= 40
                      ? 'rgba(0,157,255,0.5)'
                      : 'rgba(0,157,255,0.25)'

              return (
                <div key={data} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: pontos >= 70 ? 'var(--duo-blue)' : 'var(--text-3)', minHeight: 14, display: 'block', textAlign: 'center' }}>
                    {pontos > 0 ? pontos : ''}
                  </span>
                  <div style={{
                    width: '100%',
                    height: altura,
                    background: barBg,
                    borderRadius: 10,
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

      {/* ── Totais de atividades ───────────────────────── */}
      <div>
        <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-1)', marginBottom: '0.875rem' }}>
          Atividades
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard emoji="🤝" valor={totalReunioes}    label="Reuniões"       cor="#009dff" />
          <StatCard emoji="📖" valor={totalLeituras}    label="Leituras SPJ"   cor="#7d88e6" />
          <StatCard emoji="📝" valor={totalInventarios} label="Inventários"    cor="#8a81e5" />
          <StatCard emoji="💬" valor={totalRespostas}   label="Resp. do Guia"  cor="#22c55e" />
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
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '0.875rem' }}>
            🗓️ Últimas reuniões
          </p>
          <div>
            {checkins.slice(0, 5).map((c: any, idx: number) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: idx > 0 ? '0.75rem' : 0,
                borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                marginTop: idx > 0 ? '0.75rem' : 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.3rem' }}>🤝</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
                      {c.tipos_reuniao?.nome ?? 'Reunião'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>
                      {new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      {c.nota_beneficio != null && ` · benefício ${c.nota_beneficio}/10`}
                    </div>
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
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function MiniCard({ valor, label }: { valor: number; label: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '0.75rem', flex: 1, textAlign: 'center' }}>
      <div style={{ color: 'white', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{valor}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 700, marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}

function StatCard({ emoji, valor, label, cor }: { emoji: string; valor: number; label: string; cor: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '2.5px solid var(--border)',
      borderRadius: 16,
      padding: '1rem',
      textAlign: 'center',
      boxShadow: '0 4px 0 var(--border)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{emoji}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: cor, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700, marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}
