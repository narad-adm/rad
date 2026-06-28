'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Fire, ArrowsClockwise, SignOut } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

type ItemRanking = {
  posicao: number
  usuario_id: string
  nome: string
  pontos_semana: number
  streak_atual: number
}

const MEDAL_COLOR: Record<number, string> = {
  1: '#d97706',
  2: '#64748b',
  3: '#92400e',
}

function Posicao({ posicao }: { posicao: number }) {
  if (posicao <= 3) {
    return (
      <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}>
        <Medal size={22} weight="bold" color={MEDAL_COLOR[posicao]} />
      </div>
    )
  }
  return (
    <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}>
      <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-3)' }}>
        #{posicao}
      </span>
    </div>
  )
}

function Avatar({ nome, isUser, posicao }: { nome: string; isUser: boolean; posicao?: number }) {
  const bg = isUser
    ? 'var(--duo-blue)'
    : posicao === 1 ? '#d97706'
    : posicao === 2 ? '#64748b'
    : posicao === 3 ? '#92400e'
    : 'var(--bg-card-2)'

  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: '0.875rem',
      color: isUser || (posicao && posicao <= 3) ? 'white' : 'var(--text-2)',
      flexShrink: 0,
      border: isUser ? '2px solid var(--duo-blue)' : 'none',
    }}>
      {nome.charAt(0).toUpperCase()}
    </div>
  )
}

export default function RankingLista({
  ranking, usuarioId, inicioSemana, fimSemana,
}: {
  ranking: ItemRanking[]
  usuarioId: string
  inicioSemana: string
  fimSemana: string
}) {
  const router = useRouter()
  const [confirmSair, setConfirmSair] = useState(false)
  const [loading, setLoading] = useState(false)

  async function sairDoRanking() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('perfis')
      .update({ ranking_opt_in: false, ranking_opt_in_em: new Date().toISOString() })
      .eq('id', usuarioId)
    router.refresh()
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>Ranking</h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 700, marginTop: 2 }}>
          Semana de {inicioSemana} a {fimSemana}
        </p>
      </div>

      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'var(--duo-blue-bg)', color: 'var(--duo-blue)',
          border: '1.5px solid var(--duo-blue)',
          borderRadius: 99, padding: '4px 10px',
          fontSize: '0.72rem', fontWeight: 800,
        }}>
          <ArrowsClockwise size={12} weight="bold" />
          Renova toda segunda-feira
        </span>
      </div>

      {/* Card unificado de ranking */}
      {ranking.length > 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '2.5px solid var(--border)',
          borderRadius: 20,
          boxShadow: '0 4px 0 var(--border)',
          overflow: 'hidden',
        }}>
          {ranking.map((item, idx) => {
            const isUser = item.usuario_id === usuarioId
            return (
              <div
                key={item.usuario_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.125rem',
                  borderBottom: idx < ranking.length - 1 ? '1.5px solid var(--border)' : 'none',
                  background: isUser ? 'rgba(0,157,255,0.05)' : 'transparent',
                }}
              >
                <Posicao posicao={item.posicao} />
                <Avatar nome={item.nome} isUser={isUser} posicao={item.posicao} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{
                      fontWeight: 700, fontSize: '0.875rem',
                      color: 'var(--text-1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.nome}
                    </span>
                    {isUser && (
                      <span style={{
                        fontSize: '0.58rem', fontWeight: 800,
                        color: 'var(--duo-blue)', textTransform: 'uppercase',
                        background: 'var(--duo-blue-bg)',
                        borderRadius: 99, padding: '1px 5px',
                      }}>
                        você
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Fire size={12} weight="duotone" color="#ff6b35" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>
                      {item.streak_atual} dias
                    </span>
                  </div>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                  {item.pontos_semana} pts
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '2.5px solid var(--border)',
          borderRadius: 20,
          boxShadow: '0 4px 0 var(--border)',
          padding: '3rem 1rem',
          textAlign: 'center',
        }}>
          <Trophy size={40} weight="duotone" color="var(--text-3)" />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>
            Nenhum participante ainda.
          </p>
        </div>
      )}

      {/* Rodapé */}
      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'center' }}>
        Apenas nome, pontos e streak são visíveis para outros.
      </p>

      {/* Sair do ranking */}
      {!confirmSair ? (
        <button
          className="btn-ghost"
          onClick={() => setConfirmSair(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
        >
          <SignOut size={16} weight="bold" />
          Sair do ranking
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            className="btn-outline"
            onClick={sairDoRanking}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}
          >
            <SignOut size={14} weight="bold" />
            {loading ? 'Saindo...' : 'Confirmar'}
          </button>
          <button
            className="btn-ghost"
            onClick={() => setConfirmSair(false)}
            style={{ fontSize: '0.875rem' }}
          >
            Cancelar
          </button>
        </div>
      )}

    </div>
  )
}
