'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpen, CheckCircle } from 'lucide-react'
import type { SoPorHoje } from '@/lib/types'
import { MESES } from '@/lib/types'

interface Props {
  texto: SoPorHoje | null
  jaLeu: boolean
  userId: string
  mes: number
  dia: number
}

export default function SoHojeClient({ texto, jaLeu: jaLeuInicial, userId, mes, dia }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [jaLeu, setJaLeu] = useState(jaLeuInicial)
  const [loading, setLoading] = useState(false)
  const [celebrar, setCelebrar] = useState(false)

  async function handleMarcarLido() {
    if (jaLeu || !texto) return
    setLoading(true)

    const hoje = new Date().toISOString().split('T')[0]

    await supabase.from('leituras_spj').insert({
      usuario_id: userId,
      spj_id: texto.id,
      data: hoje,
      pontos_ganhos: 20,
    })

    // Atualizar pontuação
    const { data } = await supabase.from('pontuacao_diaria')
      .select('*').eq('usuario_id', userId).eq('data', hoje).single()

    if (data) {
      await supabase.from('pontuacao_diaria').update({
        pontos_total: Math.min(100, data.pontos_total + 20),
        leituras: data.leituras + 1,
        atualizado_em: new Date().toISOString(),
      }).eq('id', data.id)
    } else {
      await supabase.from('pontuacao_diaria').insert({
        usuario_id: userId, data: hoje,
        pontos_total: 20, leituras: 1,
      })
    }

    setJaLeu(true)
    setCelebrar(true)
    setLoading(false)
    setTimeout(() => setCelebrar(false), 3000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(241,245,249,0.4)' }}>
            SÓ POR HOJE
          </p>
          <h1 className="text-2xl font-black text-white">
            {dia} de {MESES[mes - 1]}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, rgba(103,190,217,0.3), rgba(0,195,255,0.15))' }}>
          <BookOpen size={22} color="#67bed9" />
        </div>
      </div>

      {celebrar && (
        <div className="text-center py-3 rounded-2xl"
             style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <span className="text-2xl">🎉</span>
          <span className="text-sm ml-2 font-bold" style={{ color: '#34d399' }}>
            +20 pontos! Leitura registrada!
          </span>
        </div>
      )}

      {texto ? (
        <>
          <div className="card-rad-glow">
            <h2 className="text-lg font-bold text-white mb-4 leading-snug">
              {texto.titulo}
            </h2>
            <div className="text-sm leading-relaxed space-y-3"
                 style={{ color: 'rgba(241,245,249,0.8)' }}>
              {texto.texto.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {texto.reflexao && (
              <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#67bed9' }}>
                  💭 REFLEXÃO
                </p>
                <p className="text-sm italic" style={{ color: 'rgba(241,245,249,0.6)' }}>
                  {texto.reflexao}
                </p>
              </div>
            )}
          </div>

          {jaLeu ? (
            <div className="flex items-center justify-center gap-2 py-4 rounded-2xl"
                 style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <CheckCircle size={20} color="#34d399" />
              <span className="font-semibold text-sm" style={{ color: '#34d399' }}>
                Leitura de hoje concluída!
              </span>
            </div>
          ) : (
            <button onClick={handleMarcarLido} disabled={loading} className="btn-rad">
              {loading ? 'Registrando...' : '✓ Marcar como lido (+20 pts)'}
            </button>
          )}
        </>
      ) : (
        <div className="card-rad text-center py-12">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-lg font-bold text-white mb-2">Texto não cadastrado</h3>
          <p className="text-sm" style={{ color: 'rgba(241,245,249,0.4)' }}>
            O texto do Só por Hoje para hoje ainda não foi adicionado.
          </p>
        </div>
      )}
    </div>
  )
}
