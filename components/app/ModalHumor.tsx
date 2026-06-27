'use client'
import { useState, useEffect } from 'react'
import { HUMORES, type HumorKey, getHumor } from '@/lib/humores'

interface Props {
  aberto: boolean
  onFechar: () => void
  onSalvar: (humor: HumorKey) => Promise<void>
}

export default function ModalHumor({ aberto, onFechar, onSalvar }: Props) {
  const [selecionado, setSelecionado] = useState<HumorKey | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto) setSelecionado(null)
  }, [aberto])

  if (!aberto) return null

  async function handleSalvar() {
    if (!selecionado) return
    setSalvando(true)
    await onSalvar(selecionado)
    setSalvando(false)
  }

  const humorSel = selecionado ? getHumor(selecionado) : null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onFechar}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 51,
        background: 'var(--bg-card)',
        borderRadius: '28px 28px 0 0',
        borderTop: '2px solid var(--border)',
        padding: '0 1rem 2rem',
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        animation: 'sheetUp 350ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <style>{`
          @keyframes sheetUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          @keyframes wobble {
            0%,100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{
          width: 44, height: 5,
          background: 'var(--border)',
          borderRadius: 99,
          margin: '12px auto 0',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', margin: '1rem 0 1.25rem' }}>
          <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.5rem', animation: 'wobble 0.6s ease 0.3s both' }}>
            🤔
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-1)', marginBottom: '0.25rem' }}>
            Como você está hoje?
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
            Escolha o que melhor descreve seu momento
          </p>
        </div>

        {/* Grid de humores */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}>
          {HUMORES.map((humor) => {
            const sel = selecionado === humor.key
            return (
              <button
                key={humor.key}
                onClick={() => setSelecionado(humor.key as HumorKey)}
                style={{
                  borderRadius: 16,
                  padding: '0.875rem 0.5rem',
                  background: humor.corFundo,
                  border: `2px solid ${sel ? humor.corBorda : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s',
                  transform: sel ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: sel ? `0 4px 16px ${humor.corFundo}` : 'none',
                }}
              >
                <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>{humor.emoji}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: sel ? humor.corLabel : 'var(--text-2)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {humor.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Botão de confirmar */}
        {selecionado && (
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              animation: 'fadeUp 0.2s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{humorSel?.emoji}</span>
            {salvando ? 'Salvando...' : 'Registrar humor'}
          </button>
        )}
      </div>
    </>
  )
}
