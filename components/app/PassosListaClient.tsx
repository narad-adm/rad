'use client'
import { useRouter } from 'next/navigation'
import { CheckCircle, CaretRight, ChatCircleText } from '@phosphor-icons/react'
import { NOMES_PASSOS } from '@/lib/types'

interface PassoStat {
  passo: number
  total: number
  feitas: number
}

interface Props {
  statsPorPasso: PassoStat[]
  totalRespondidas: number
  totalPontosGanhos: number
  passosIniciados: number
}

export default function PassosListaClient({
  statsPorPasso, totalRespondidas, totalPontosGanhos, passosIniciados,
}: Props) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            GUIA DOS PASSOS
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>Os 12 Passos</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {totalRespondidas} pergunta{totalRespondidas !== 1 ? 's' : ''} respondida{totalRespondidas !== 1 ? 's' : ''} no total
          </p>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: 'var(--duo-pink-bg)',
          border: '2px solid var(--duo-pink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChatCircleText size={24} weight="duotone" color="var(--duo-pink)" />
        </div>
      </div>

      {/* Stats row */}
      <div className="card" style={{ display: 'flex', padding: '1rem 0' }}>
        {[
          { valor: totalRespondidas, label: 'respondidas' },
          { valor: totalPontosGanhos, label: 'pontos ganhos' },
          { valor: passosIniciados, label: 'passos iniciados' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{item.valor}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 700, marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* 12 Passos */}
      <div className="space-y-3">
        {statsPorPasso.map(({ passo, total, feitas }) => {
          const pct = total > 0 ? Math.round((feitas / total) * 100) : 0
          const concluido = feitas === total && total > 0
          const iniciado = feitas > 0 && !concluido

          return (
            <button
              key={passo}
              onClick={() => router.push(`/passos/${passo}`)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                background: 'var(--bg-card)',
                border: `2px solid ${concluido ? 'var(--duo-green)' : iniciado ? 'var(--duo-blue)' : 'var(--border)'}`,
                borderRadius: 16, padding: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Número */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: concluido ? 'var(--duo-green)' : iniciado ? 'var(--duo-blue-bg)' : 'var(--bg-card-2)',
                border: `2px solid ${concluido ? 'var(--duo-green-dark)' : iniciado ? 'var(--duo-blue)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 900,
                color: concluido ? 'white' : iniciado ? 'var(--duo-blue)' : 'var(--text-3)',
              }}>
                {concluido ? <CheckCircle size={22} weight="bold" color="white" /> : passo}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)', marginBottom: 4 }}>
                  {NOMES_PASSOS[passo]}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 6 }}>
                  {total === 0 ? 'Carregando...' : `${feitas} de ${total} perguntas`}
                </div>
                {/* Progress bar */}
                {total > 0 && (
                  <div style={{ height: 6, background: 'var(--duo-gray-light)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${pct}%`,
                      background: concluido ? 'var(--duo-green)' : 'var(--duo-blue)',
                      transition: 'width 0.8s ease',
                      minWidth: pct > 0 ? 6 : 0,
                    }} />
                  </div>
                )}
                {concluido && (
                  <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'var(--duo-green-bg)', color: 'var(--duo-green)',
                    fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>
                    <CheckCircle size={10} weight="bold" />
                    Concluído
                  </div>
                )}
              </div>

              <CaretRight size={16} weight="bold" color="var(--text-3)" style={{ flexShrink: 0 }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
