'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpenText, CheckCircle } from '@phosphor-icons/react'
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
        usuario_id: userId, data: hoje, pontos_total: 20, leituras: 1,
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
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            SÓ POR HOJE
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>
            {dia} de {MESES[mes - 1]}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'var(--accent-grad)' }}>
          <BookOpenText size={22} weight="duotone" color="white" />
        </div>
      </div>

      {celebrar && (
        <div className="pop-in text-center py-3 rounded-2xl"
             style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="text-2xl">🎉</span>
          <span className="text-sm ml-2 font-bold" style={{ color: 'var(--success)' }}>
            +20 pontos! Leitura registrada!
          </span>
        </div>
      )}

      {texto ? (
        <>
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '1rem', lineHeight: '1.4' }}>
              {texto.titulo}
            </h2>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-2)' }} className="space-y-3">
              {texto.texto.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {texto.reflexao && (
              <div className="mt-5 pt-4" style={{ borderTop: '1.5px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                  💭 REFLEXÃO
                </p>
                <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-2)' }}>
                  {texto.reflexao}
                </p>
              </div>
            )}
          </div>

          {jaLeu ? (
            <div className="flex items-center justify-center gap-2 py-4 rounded-2xl"
                 style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle size={20} weight="bold" color="#22c55e" />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--success)' }}>
                Leitura de hoje concluída!
              </span>
            </div>
          ) : (
            <button onClick={handleMarcarLido} disabled={loading} className="btn-primary">
              {loading ? 'Registrando...' : '✓ Marcar como lido (+20 pts)'}
            </button>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Texto não cadastrado
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
            O texto do Só por Hoje para hoje ainda não foi adicionado.
          </p>
        </div>
      )}
    </div>
  )
}
