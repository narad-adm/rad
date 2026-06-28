'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hojeEmBRT } from '@/lib/utils'
import { BookOpenText, CheckCircle, SunHorizon } from '@phosphor-icons/react'
import type { SoPorHoje } from '@/lib/types'
import { MESES, DIAS_SEMANA } from '@/lib/types'

interface Props {
  texto: SoPorHoje | null
  jaLeu: boolean
  userId: string
  mes: number
  dia: number
}

export default function SoHojeClient({ texto, jaLeu: jaLeuInicial, userId, mes, dia }: Props) {
  const supabase = createClient()
  const [jaLeu, setJaLeu] = useState(jaLeuInicial)
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState(false)

  const agora = new Date()
  const diaSemana = DIAS_SEMANA[agora.getDay()]
  const nomeMes = MESES[mes - 1]

  async function handleMarcarLido() {
    if (jaLeu || !texto) return
    setLoading(true)

    const hojeStr = hojeEmBRT()

    await supabase.from('leituras_spj').insert({
      usuario_id: userId,
      spj_id: texto.id,
      data: hojeStr,
      pontos_ganhos: 20,
    })

    const { data } = await supabase
      .from('pontuacao_diaria')
      .select('*')
      .eq('usuario_id', userId)
      .eq('data', hojeStr)
      .single()

    if (data) {
      await supabase.from('pontuacao_diaria').update({
        pontos_total: Math.min(100, data.pontos_total + 20),
        leituras: data.leituras + 1,
        atualizado_em: new Date().toISOString(),
      }).eq('id', data.id)
    } else {
      await supabase.from('pontuacao_diaria').insert({
        usuario_id: userId, data: hojeStr, pontos_total: 20, leituras: 1,
      })
    }

    setJaLeu(true)
    setLoading(false)
    setBanner(true)
    setTimeout(() => setBanner(false), 2500)
  }

  // Divide o texto em parágrafos
  function renderReflexao(t: string) {
    const paragrafos = t.split('\n').filter(p => p.trim())
    const longo = t.length > 100
    return paragrafos.map((p, i) => {
      if (i === 0 && longo) {
        const primeiraLetra = p[0]
        const resto = p.slice(1)
        return (
          <p key={i} style={{ marginBottom: '0.875rem', lineHeight: 1.8, fontSize: '1rem', color: 'var(--text-1)' }}>
            <span style={{
              float: 'left',
              fontSize: '2.5rem',
              fontWeight: 900,
              lineHeight: 0.85,
              margin: '0.1rem 0.4rem 0 0',
              color: 'var(--duo-blue)',
            }}>
              {primeiraLetra}
            </span>
            {resto}
          </p>
        )
      }
      return (
        <p key={i} style={{ marginBottom: '0.875rem', lineHeight: 1.8, fontSize: '1rem', color: 'var(--text-1)', fontWeight: 400 }}>
          {p}
        </p>
      )
    })
  }

  return (
    <>
      {/* Banner de celebração */}
      {banner && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          padding: '1rem',
          textAlign: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: '1rem',
          animation: 'slideDown 0.3s ease',
        }}>
          <style>{`@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }`}</style>
          📖 +20 pontos! Leitura registrada!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Header ──────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.375rem' }}>
            <BookOpenText size={16} weight="duotone" color="var(--duo-blue)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-3)' }}>
              SÓ POR HOJE
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>
            {diaSemana}, {dia} de {nomeMes}
          </p>
          {texto && (
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1.25 }}>
              {texto.titulo}
            </h1>
          )}
        </div>

        {texto ? (
          <>
            {/* ── Citação ─────────────────────────────── */}
            {texto.citacao && (
              <div style={{
                background: 'var(--duo-blue)',
                borderRadius: 20,
                padding: '1.25rem 1.25rem 1.25rem 1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <span style={{
                  position: 'absolute',
                  top: -10, left: 10,
                  fontSize: '5rem',
                  color: 'rgba(255,255,255,0.15)',
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  "
                </span>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontStyle: 'italic',
                  color: 'white',
                  lineHeight: 1.6,
                  position: 'relative',
                }}>
                  {texto.citacao}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: '0.75rem',
                  textAlign: 'right',
                }}>
                  — Texto Básico de NA
                </p>
              </div>
            )}

            {/* ── Separador ───────────────────────────── */}
            <Separador />

            {/* ── Reflexão principal ──────────────────── */}
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.875rem' }}>
                REFLEXÃO
              </p>
              <div style={{ clearfix: 'both' } as React.CSSProperties}>
                {renderReflexao(texto.texto)}
              </div>
            </div>

            {/* ── Afirmação ───────────────────────────── */}
            {texto.afirmacao && (
              <>
                <Separador />
                <div style={{
                  background: 'var(--bg-card-2)',
                  border: '2px solid var(--duo-blue)',
                  borderRadius: 20,
                  padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <SunHorizon size={18} weight="bold" color="var(--duo-blue)" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--duo-blue)' }}>
                      SÓ POR HOJE
                    </span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {texto.afirmacao}
                  </p>
                </div>
              </>
            )}

            {/* ── Botão / conclusão ───────────────────── */}
            <div style={{ marginTop: '0.5rem' }}>
              {jaLeu ? (
                <div style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '2px solid rgba(34,197,94,0.3)',
                  borderRadius: 16,
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  animation: 'popIn 0.3s ease',
                }}>
                  <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
                  <CheckCircle size={24} weight="bold" color="#22c55e" />
                  <span style={{ fontWeight: 800, color: '#22c55e' }}>
                    Leitura de hoje concluída! 💙
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleMarcarLido}
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <CheckCircle size={20} weight="bold" />
                  {loading ? 'Registrando...' : 'Marcar como lido · +20 pts'}
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── Sem meditação ──────────────────────────── */
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
            padding: '4rem 1rem',
            gap: '1rem',
          }}>
            <BookOpenText size={64} weight="duotone" color="var(--text-3)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.375rem' }}>
                Meditação não disponível
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
                A leitura para hoje ainda não foi cadastrada.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Separador() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>❖</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
