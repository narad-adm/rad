'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatCircleText, CaretDown, CaretUp, PaperPlaneTilt, CheckCircle } from '@phosphor-icons/react'
import type { PassoPergunta, RespostaPasso } from '@/lib/types'

interface Props {
  perguntas: PassoPergunta[]
  respostas: RespostaPasso[]
  userId: string
}

export default function PassosClient({ perguntas, respostas: respostasIniciais, userId }: Props) {
  const supabase = createClient()
  const [respostas, setRespostas] = useState(respostasIniciais)
  const [passoAtivo, setPassoAtivo] = useState<number | null>(1)
  const [textosResposta, setTextosResposta] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState<string | null>(null)
  const [celebrar, setCelebrar] = useState(false)

  const passos = Array.from(new Set(perguntas.map(p => p.passo))).sort()
  const perguntasRespondidas = new Set(respostas.map(r => r.pergunta_id))

  async function handleResponder(perguntaId: string) {
    const texto = textosResposta[perguntaId]?.trim()
    if (!texto) return
    setSalvando(perguntaId)

    const { data, error } = await supabase.from('respostas_passos').insert({
      usuario_id: userId,
      pergunta_id: perguntaId,
      resposta: texto,
      pontos_ganhos: 15,
    }).select('*, passos_perguntas(*)').single()

    if (!error && data) {
      setRespostas(prev => [data, ...prev])
      setTextosResposta(prev => ({ ...prev, [perguntaId]: '' }))

      const hoje = new Date().toISOString().split('T')[0]
      const { data: pont } = await supabase.from('pontuacao_diaria')
        .select('*').eq('usuario_id', userId).eq('data', hoje).single()

      if (pont) {
        await supabase.from('pontuacao_diaria').update({
          pontos_total: Math.min(100, pont.pontos_total + 15),
          passos: pont.passos + 1,
          atualizado_em: new Date().toISOString(),
        }).eq('id', pont.id)
      } else {
        await supabase.from('pontuacao_diaria').insert({
          usuario_id: userId, data: hoje, pontos_total: 15, passos: 1,
        })
      }

      setCelebrar(true)
      setTimeout(() => setCelebrar(false), 2000)
    }
    setSalvando(null)
  }

  const totalRespostas = respostas.length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            GUIA DOS PASSOS
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>Os 12 Passos</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          <ChatCircleText size={22} weight="duotone" color="white" />
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div className="text-center">
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-1)' }}>{totalRespostas}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700 }}>respostas</div>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
        <div className="text-center">
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--success)' }}>
            {perguntasRespondidas.size}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700 }}>perguntas feitas</div>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
        <div className="text-center">
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent)' }}>
            {totalRespostas * 15}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700 }}>pontos ganhos</div>
        </div>
      </div>

      {celebrar && (
        <div className="pop-in text-center py-3 rounded-2xl"
             style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--success)' }}>
            ✨ +15 pontos! Continue respondendo!
          </span>
        </div>
      )}

      {/* Lista de passos */}
      <div className="space-y-3">
        {passos.map(passo => {
          const perguntasDoPasso = perguntas.filter(p => p.passo === passo)
          const aberto = passoAtivo === passo
          const respondidas = perguntasDoPasso.filter(p => perguntasRespondidas.has(p.id)).length
          const completo = respondidas === perguntasDoPasso.length

          return (
            <div key={passo} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setPassoAtivo(aberto ? null : passo)}
                className="w-full flex items-center justify-between text-left"
                style={{ padding: '1.25rem', background: aberto ? 'var(--bg-card-2)' : 'transparent' }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.875rem', flexShrink: 0,
                    background: completo
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'rgba(0,157,255,0.15)',
                    color: completo ? 'white' : 'var(--accent)',
                  }}>
                    {passo}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)' }}>Passo {passo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      {respondidas}/{perguntasDoPasso.length} perguntas respondidas
                    </div>
                  </div>
                </div>
                <div style={{ color: 'var(--text-3)' }}>
                  {aberto
                    ? <CaretUp size={18} weight="bold" />
                    : <CaretDown size={18} weight="bold" />
                  }
                </div>
              </button>

              {aberto && (
                <div className="space-y-4" style={{
                  padding: '0 1.25rem 1.25rem',
                  borderTop: '1.5px solid var(--border)',
                  paddingTop: '1.25rem',
                }}>
                  {perguntasDoPasso.map(pergunta => {
                    const jaRespondeu = perguntasRespondidas.has(pergunta.id)
                    const ultimaResposta = respostas.find(r => r.pergunta_id === pergunta.id)

                    return (
                      <div key={pergunta.id} className="space-y-2">
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-1)', lineHeight: '1.6' }}>
                          {pergunta.pergunta}
                        </p>

                        {ultimaResposta && (
                          <div style={{
                            borderRadius: 12, padding: '0.75rem',
                            background: 'var(--bg-card-2)', fontSize: '0.8rem',
                            color: 'var(--text-2)',
                          }}>
                            <span style={{ fontWeight: 800, color: 'var(--success)' }}>
                              Sua última resposta:{' '}
                            </span>
                            {ultimaResposta.resposta}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <textarea
                            className="input-field flex-1"
                            rows={2}
                            placeholder={jaRespondeu ? 'Responder novamente...' : 'Escreva sua resposta...'}
                            value={textosResposta[pergunta.id] ?? ''}
                            onChange={e => setTextosResposta(prev => ({
                              ...prev, [pergunta.id]: e.target.value
                            }))}
                            style={{ resize: 'none', fontSize: '0.875rem' }}
                          />
                          <button
                            onClick={() => handleResponder(pergunta.id)}
                            disabled={!textosResposta[pergunta.id]?.trim() || salvando === pergunta.id}
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 self-end transition-all"
                            style={{
                              background: textosResposta[pergunta.id]?.trim()
                                ? 'var(--accent-grad)'
                                : 'var(--bg-card-2)',
                              border: '1.5px solid var(--border)',
                              color: textosResposta[pergunta.id]?.trim() ? 'white' : 'var(--text-3)',
                              cursor: textosResposta[pergunta.id]?.trim() ? 'pointer' : 'not-allowed',
                            }}>
                            <PaperPlaneTilt size={16} weight="bold" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
