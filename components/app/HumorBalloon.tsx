'use client'
import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { getHumor } from '@/lib/humores'

interface Props {
  jaRespondeuHoje: boolean
  humorHoje: string | null
  onAbrir: () => void
}

const COR_PRINCIPAL = '#9055d4'
const COR_SOMBRA    = '#6b3ea0'
const COR_BOTAO_BG  = 'rgba(255,255,255,0.22)'

export default function HumorBalloon({ jaRespondeuHoje, humorHoje, onAbrir }: Props) {
  const [dispensado, setDispensado] = useState(false)

  if (dispensado) return null

  // Versão compacta — já respondeu
  if (jaRespondeuHoje && humorHoje) {
    const humor = getHumor(humorHoje)
    return (
      <div
        title="Seu humor de hoje"
        style={{
          position: 'fixed',
          bottom: 96,
          right: 16,
          zIndex: 40,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: humor?.corFundo ?? 'var(--bg-card)',
          border: `2px solid ${humor?.corBorda ?? 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {humor?.emoji ?? '😊'}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 96,
      right: 16,
      zIndex: 40,
      animation: 'humorPop 0.4s cubic-bezier(0.34,1.56,0.64,1) 1.2s both, humorFloat 3s ease-in-out 2s infinite',
    }}>
      <style>{`
        @keyframes humorPop {
          from { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.05); }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes humorFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>

      {/* Botão X */}
      <button
        onClick={(e) => { e.stopPropagation(); setDispensado(true) }}
        style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-3)',
          padding: 0,
          zIndex: 2,
        }}
      >
        <X size={11} weight="bold" />
      </button>

      {/* Card principal */}
      <div style={{
        background: COR_PRINCIPAL,
        borderRadius: 18,
        boxShadow: `0 5px 0 ${COR_SOMBRA}`,
        padding: '0.875rem',
        width: 210,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {/* Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🤔</span>
          <p style={{
            color: 'white',
            fontWeight: 900,
            fontSize: '0.95rem',
            lineHeight: 1.25,
          }}>
            Como você está hoje?
          </p>
        </div>

        {/* Botão estilo Duolingo */}
        <div style={{
          background: COR_BOTAO_BG,
          borderRadius: 12,
          padding: 3,
        }}>
          <button
            onClick={onAbrir}
            style={{
              background: 'white',
              borderRadius: 10,
              width: '100%',
              padding: '0.5rem',
              color: COR_PRINCIPAL,
              fontWeight: 800,
              fontSize: '0.8rem',
              fontFamily: 'Nunito, sans-serif',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            REGISTRAR
          </button>
        </div>
      </div>

      {/* Cauda do balão */}
      <div style={{
        position: 'absolute',
        bottom: -9,
        right: 22,
        width: 0, height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: `9px solid ${COR_SOMBRA}`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -4,
        right: 24,
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${COR_PRINCIPAL}`,
      }} />
    </div>
  )
}
