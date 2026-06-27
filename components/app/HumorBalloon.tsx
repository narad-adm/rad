'use client'
import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { getHumor } from '@/lib/humores'

interface Props {
  jaRespondeuHoje: boolean
  humorHoje: string | null
  onAbrir: () => void
}

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

  // Balão de pergunta
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
          50%       { transform: translateY(-6px); }
        }
      `}</style>

      {/* Cauda do balão */}
      <div style={{
        position: 'absolute',
        bottom: -8,
        right: 18,
        width: 0,
        height: 0,
        borderLeft: '9px solid transparent',
        borderRight: '9px solid transparent',
        borderTop: '9px solid var(--duo-blue)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -5,
        right: 20,
        width: 0,
        height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: '7px solid var(--bg-card)',
        zIndex: 2,
      }} />

      {/* Card */}
      <button
        onClick={onAbrir}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--bg-card)',
          border: '2px solid var(--duo-blue)',
          borderRadius: 18,
          padding: '0.625rem 0.875rem',
          boxShadow: '0 4px 24px rgba(0,157,255,0.2)',
          cursor: 'pointer',
          paddingRight: '2.25rem',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🤔</span>
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
          Como você está hoje?
        </span>

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
            background: 'var(--bg-card-2)',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-3)',
            padding: 0,
          }}
        >
          <X size={11} weight="bold" />
        </button>
      </button>
    </div>
  )
}
