'use client'
import { Fire, Trophy, UsersFour, BookOpenText, ClipboardText, ChatCircleText } from '@phosphor-icons/react'

interface Props {
  diasLimpo: number
  streak: number
  streakMax: number
  pontuacoes: any[]
  checkins: any[]
  totalLeituras: number
  totalRespostas: number
  totalInventarios: number
}

export default function RelatoriosClient({
  diasLimpo, streak, streakMax, pontuacoes, checkins,
  totalLeituras, totalRespostas, totalInventarios,
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
      dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
      pontos: pont?.pontos_total ?? 0,
      data: str,
    }
  })

  const hoje = new Date().toISOString().split('T')[0]
  const maxVal = Math.max(...ultimos7.map(d => d.pontos), 100)

  return (
    <div className="space-y-5">
      <div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          MEU PROGRESSO
        </p>
        <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>Histórico</h1>
      </div>

      {/* Hero — Tempo Limpo */}
      <div style={{ background: 'var(--accent-grad)', borderRadius: 24, padding: '1.75rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1rem' }}>
          TEMPO LIMPO
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {anos > 0 && <MiniCard valor={anos} label="anos" grande={false} />}
          {(anos > 0 || meses > 0) && <MiniCard valor={meses} label="meses" grande={false} />}
          <MiniCard valor={dias} label="dias" grande={anos === 0 && meses === 0} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 700, marginTop: '1rem' }}>
          Só por hoje 💙
        </p>
      </div>

      {/* Streak e Recorde */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: streak > 0 ? 'var(--streak-card-bg)' : 'var(--bg-card)',
          border: '2px solid rgba(255,107,53,0.3)',
          borderRadius: 20, padding: '1.25rem', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,107,53,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: streak > 0 ? '#ff6b35' : 'var(--text-3)',
          }}>
            <Fire size={24} weight="duotone" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: streak > 0 ? '#ff6b35' : 'var(--text-3)', lineHeight: 1 }}>
            {streak}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: '0.25rem', fontWeight: 700 }}>
            sequência atual
          </div>
        </div>
        <div style={{
          background: 'var(--trophy-card-bg)',
          border: '2px solid rgba(234,179,8,0.3)',
          borderRadius: 20, padding: '1.25rem', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'rgba(217,119,6,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem', color: '#d97706',
          }}>
            <Trophy size={24} weight="duotone" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{streakMax}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: '0.25rem', fontWeight: 700 }}>
            recorde pessoal
          </div>
        </div>
      </div>

      {/* Gráfico dos últimos 7 dias */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em' }}>
            ÚLTIMOS 7 DIAS
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>
            média {mediaPontos} pts/dia
          </span>
        </div>

        <div style={{ position: 'relative', marginTop: '0.75rem' }}>
          {/* Linha de referência 70 pts */}
          <div style={{
            position: 'absolute',
            top: `${(1 - 70 / maxVal) * 80}px`,
            left: 0, right: 0,
            borderTop: '2px dashed rgba(0,157,255,0.25)',
            zIndex: 1,
          }}>
            <span style={{
              position: 'absolute', right: 0,
              fontSize: '0.6rem', fontWeight: 800,
              color: 'rgba(0,157,255,0.5)',
              transform: 'translateY(-100%)',
            }}>meta</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {ultimos7.map(({ dia, pontos, data }) => {
              const isHoje = data === hoje
              const altura = pontos > 0 ? Math.max(6, (pontos / maxVal) * 80) : 6
              const barBg = isHoje
                ? 'var(--accent-grad)'
                : pontos >= 70
                  ? 'rgba(0,157,255,0.8)'
                  : pontos >= 40
                    ? 'rgba(0,157,255,0.4)'
                    : pontos > 0
                      ? 'var(--border)'
                      : 'var(--bg-card-2)'

              return (
                <div key={data} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: pontos >= 70 ? 'var(--accent)' : 'var(--text-3)', minHeight: 14 }}>
                    {pontos > 0 ? pontos : ''}
                  </div>
                  <div style={{
                    width: '100%',
                    height: altura,
                    background: barBg,
                    borderRadius: 6,
                    boxShadow: isHoje ? '0 4px 12px rgba(0,157,255,0.3)' : 'none',
                    border: pontos === 0 ? '1.5px dashed var(--border)' : 'none',
                  }} />
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {ultimos7.map(({ dia, data }) => {
              const isHoje = data === hoje
              return (
                <div key={data} style={{
                  flex: 1, textAlign: 'center',
                  fontSize: '0.65rem', fontWeight: isHoje ? 800 : 600,
                  color: isHoje ? 'var(--accent)' : 'var(--text-3)',
                  textTransform: 'capitalize',
                }}>
                  {dia}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Totais de atividades */}
      <div className="card">
        <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '1rem' }}>
          TOTAL DE ATIVIDADES
        </p>
        <div className="space-y-3">
          <StatRow
            icon={<UsersFour size={16} weight="bold" />}
            label="Reuniões registradas"
            valor={totalReunioes}
            cor="#009dff"
          />
          <StatRow
            icon={<BookOpenText size={16} weight="duotone" />}
            label="Leituras do Só por Hoje"
            valor={totalLeituras}
            cor="#7d88e6"
          />
          <StatRow
            icon={<ClipboardText size={16} weight="duotone" />}
            label="Inventários (10° Passo)"
            valor={totalInventarios}
            cor="#8a81e5"
          />
          <StatRow
            icon={<ChatCircleText size={16} weight="duotone" />}
            label="Respostas do guia"
            valor={totalRespostas}
            cor="#22c55e"
          />
        </div>
      </div>

      {/* Últimas reuniões */}
      {checkins.length > 0 && (
        <div className="card">
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '1rem' }}>
            ÚLTIMAS REUNIÕES
          </p>
          <div className="space-y-3">
            {checkins.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
                    {c.tipos_reuniao?.nome ?? 'Reunião'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    {new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short',
                    })}
                    {c.nota_beneficio != null && ` · benefício: ${c.nota_beneficio}/10`}
                  </div>
                </div>
                <span className="badge badge-blue">+{c.pontos_ganhos}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MiniCard({ valor, label, grande }: { valor: number; label: string; grande: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '0.75rem', flex: 1, textAlign: 'center' }}>
      <div style={{ color: 'white', fontSize: grande ? '2.5rem' : '2rem', fontWeight: 900, lineHeight: 1 }}>{valor}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 700, marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}

function StatRow({ icon, label, valor, cor }: {
  icon: React.ReactNode; label: string; valor: number; cor: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${cor}20`, color: cor,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{label}</span>
      </div>
      <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{valor}</span>
    </div>
  )
}
