'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Fire, ArrowsClockwise, SignOut, UserCircle } from '@phosphor-icons/react'
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
  2: '#94a3b8',
  3: '#92400e',
}

function MedalIcon({ posicao, size = 20 }: { posicao: number; size?: number }) {
  if (posicao <= 3) {
    return <Medal size={size} weight="bold" color={MEDAL_COLOR[posicao]} />
  }
  return (
    <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-3)', minWidth: 28, textAlign: 'center' }}>
      #{posicao}
    </span>
  )
}

function Avatar({
  nome, size, isUser, posicao,
}: { nome: string; size: number; isUser: boolean; posicao?: number }) {
  const bg = isUser
    ? 'var(--accent-grad)'
    : posicao === 1 ? 'linear-gradient(135deg,#d97706,#fbbf24)'
    : posicao === 2 ? 'linear-gradient(135deg,#64748b,#94a3b8)'
    : posicao === 3 ? 'linear-gradient(135deg,#78350f,#b45309)'
    : 'var(--bg-card-2)'

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito', fontWeight: 900,
      fontSize: size * 0.4,
      color: isUser || (posicao && posicao <= 3) ? 'white' : 'var(--text-2)',
      flexShrink: 0,
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

  const euNoRanking = ranking.find(r => r.usuario_id === usuarioId)
  const top3 = ranking.slice(0, 3)
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3

  async function sairDoRanking() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('perfis')
      .update({ ranking_opt_in: false, ranking_opt_in_em: new Date().toISOString() })
      .eq('id', usuarioId)
    router.refresh()
  }

  const podiumHeight: Record<number, number> = { 1: 140, 2: 110, 3: 90 }

  return (
    <main style={{ padding: '1.5rem 1rem 6rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.75rem', color: 'var(--text-1)', margin: 0 }}>
          Ranking
        </h1>
        <p style={{ color: 'var(--text-2)', margin: '0.25rem 0 0.75rem' }}>
          Semana de {inicioSemana} a {fimSemana}
        </p>
        <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <ArrowsClockwise size={12} weight="bold" />
          Renova toda segunda-feira
        </span>
      </div>

      {/* Card do usuário logado */}
      {euNoRanking && (
        <div className="card" style={{
          border: '2px solid var(--accent)',
          background: 'rgba(0,157,255,0.05)',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MedalIcon posicao={euNoRanking.posicao} size={24} />
            <Avatar nome={euNoRanking.nome} size={44} isUser posicao={euNoRanking.posicao} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{euNoRanking.nome}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>VOCÊ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                <Fire size={14} weight="duotone" color="#ff6b35" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{euNoRanking.streak_atual} dias</span>
              </div>
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-1)' }}>
              {euNoRanking.pontos_semana} pts
            </span>
          </div>
        </div>
      )}

      {/* Pódio */}
      {top3.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.75rem', minHeight: 170 }}>
            {podiumOrder.map((item) => (
              <div key={item.usuario_id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                height: podiumHeight[item.posicao] ?? 90,
                justifyContent: 'flex-end',
              }}>
                <Avatar
                  nome={item.nome}
                  size={item.posicao === 1 ? 72 : item.posicao === 2 ? 60 : 52}
                  isUser={item.usuario_id === usuarioId}
                  posicao={item.posicao}
                />
                <Medal size={20} weight="bold" color={MEDAL_COLOR[item.posicao]} />
                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-1)', maxWidth: 70, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.nome}
                </span>
                <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-1)' }}>
                  {item.pontos_semana} pts
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Fire size={12} weight="duotone" color="#ff6b35" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{item.streak_atual}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista completa */}
      <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: '0.75rem' }}>
        Todos os participantes
      </p>

      {ranking.map(item => {
        const isUser = item.usuario_id === usuarioId
        return (
          <div key={item.usuario_id} className="card" style={{
            padding: '0.875rem',
            borderRadius: 16,
            marginBottom: '0.5rem',
            border: isUser ? '2px solid var(--accent)' : undefined,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MedalIcon posicao={item.posicao} size={18} />
              <Avatar nome={item.nome} size={32} isUser={isUser} posicao={item.posicao} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</span>
                  {isUser && <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>você</span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Fire size={12} weight="duotone" color="#ff6b35" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{item.streak_atual}</span>
                  </span>
                </div>
              </div>
              <span style={{ fontWeight: 900, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                {item.pontos_semana} pts
              </span>
            </div>
          </div>
        )
      })}

      {ranking.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-3)' }}>
          <Trophy size={40} weight="duotone" color="var(--text-3)" />
          <p style={{ marginTop: '0.75rem' }}>Nenhum participante ainda.</p>
        </div>
      )}

      {/* Rodapé */}
      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', textAlign: 'center', margin: '1.25rem 0 1rem' }}>
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

    </main>
  )
}
