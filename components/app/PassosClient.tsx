'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react'
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

      // Atualizar pontuação
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
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(241,245,249,0.4)' }}>
            GUIA DOS PASSOS
          </p>
          <h1 className="text-2xl font-black text-white">Os 12 Passos</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.15))' }}>
          <MessageSquare size={22} color="#34d399" />
        </div>
      </div>

      {/* Stats */}
      <div className="card-rad flex items-center justify-between">
        <div className="text-center">
          <div className="text-2xl font-black text-white">{totalRespostas}</div>
          <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>respostas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black" style={{ color: '#34d399' }}>
            {perguntasRespondidas.size}
          </div>
          <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>perguntas feitas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black" style={{ color: '#00c3ff' }}>
            {totalRespostas * 15}
          </div>
          <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>pontos ganhos</div>
        </div>
      </div>

      {celebrar && (
        <div className="text-center py-3 rounded-2xl"
             style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <span className="font-bold text-sm" style={{ color: '#34d399' }}>
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

          return (
            <div key={passo} className="card-rad overflow-hidden">
              <button
                onClick={() => setPassoAtivo(aberto ? null : passo)}
                className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                       style={{
                         background: respondidas === perguntasDoPasso.length
                           ? 'linear-gradient(135deg, #34d399, #10b981)'
                           : 'rgba(0,195,255,0.15)',
                         color: respondidas === perguntasDoPasso.length ? 'white' : '#00c3ff',
                       }}>
                    {passo}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Passo {passo}</div>
                    <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>
                      {respondidas}/{perguntasDoPasso.length} perguntas respondidas
                    </div>
                  </div>
                </div>
                {aberto ? (
                  <ChevronUp size={18} color="rgba(241,245,249,0.4)" />
                ) : (
                  <ChevronDown size={18} color="rgba(241,245,249,0.4)" />
                )}
              </button>

              {aberto && (
                <div className="mt-4 space-y-4 pt-4 border-t"
                     style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {perguntasDoPasso.map(pergunta => {
                    const jaRespondeu = perguntasRespondidas.has(pergunta.id)
                    const ultimaResposta = respostas.find(r => r.pergunta_id === pergunta.id)

                    return (
                      <div key={pergunta.id} className="space-y-2">
                        <p className="text-sm text-white leading-relaxed">
                          {pergunta.pergunta}
                        </p>

                        {ultimaResposta && (
                          <div className="rounded-xl p-3 text-xs"
                               style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(241,245,249,0.6)' }}>
                            <span className="font-semibold" style={{ color: '#34d399' }}>
                              Sua última resposta:{' '}
                            </span>
                            {ultimaResposta.resposta}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <textarea
                            className="input-rad flex-1"
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
                                ? 'linear-gradient(135deg, #0445de, #00c3ff)'
                                : 'rgba(255,255,255,0.06)',
                            }}>
                            <Send size={16} color="white" />
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
