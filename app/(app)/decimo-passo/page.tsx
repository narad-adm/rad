'use client'
import { useState, useEffect } from 'react'
import { ClipboardText, CheckCircle, Star, MagnifyingGlass, HandsPraying, Heart, Warning, Sparkle, type Icon } from '@phosphor-icons/react'
import { buscarInventarioHoje, salvarInventario } from '@/app/actions/inventario'

const PERGUNTAS = [
  { key: 'honestidade',   titulo: 'Honestidade',      pergunta: 'Onde fui honesto hoje? E onde fui desonesto?' },
  { key: 'admissoes',     titulo: 'Admissões',         pergunta: 'O que preciso admitir, reparar ou melhorar?' },
  { key: 'contribuicoes', titulo: 'Contribuições',     pergunta: 'Contribuí positivamente para mim e para os outros? E negativamente?' },
  { key: 'doenca',        titulo: 'Minha doença',      pergunta: 'Tive vontade de usar? Minha doença se manifestou de alguma forma hoje? Como?' },
  { key: 'acoes_limpeza', titulo: 'Minha recuperação', pergunta: 'O que fiz hoje para me manter limpo(a)?' },
]

const PERGUNTA_ICONS: Record<string, Icon> = {
  honestidade:   MagnifyingGlass,
  admissoes:     HandsPraying,
  contribuicoes: Heart,
  doenca:        Warning,
  acoes_limpeza: Sparkle,
}

const PERGUNTA_COLORS: Record<string, string> = {
  honestidade:   'var(--duo-blue)',
  admissoes:     'var(--duo-purple)',
  contribuicoes: 'var(--duo-pink)',
  doenca:        'var(--duo-orange)',
  acoes_limpeza: 'var(--duo-green)',
}

export default function DecimoPasso() {
  const [jaFez, setJaFez] = useState(false)
  const [respostas, setRespostas] = useState({
    honestidade: '', admissoes: '', contribuicoes: '', doenca: '', acoes_limpeza: ''
  })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [celebrar, setCelebrar] = useState(false)

  useEffect(() => {
    async function verificar() {
      const data = await buscarInventarioHoje()
      if (data === null && typeof window !== 'undefined') {
        // null pode ser "não autenticado" ou "não preencheu hoje"
      }
      if (data) {
        setJaFez(true)
        setRespostas({
          honestidade:   data.honestidade,
          admissoes:     data.admissoes,
          contribuicoes: data.contribuicoes,
          doenca:        data.doenca,
          acoes_limpeza: data.acoes_limpeza,
        })
      }
      setLoading(false)
    }
    verificar()
  }, [])

  async function handleSalvar() {
    setSalvando(true)
    await salvarInventario(respostas)
    setJaFez(true)
    setCelebrar(true)
    setSalvando(false)
    setTimeout(() => setCelebrar(false), 3000)
  }

  const temAlgumaResposta = Object.values(respostas).some(r => r.trim().length > 0)

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes sk-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
          .sk {
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-2) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: sk-shimmer 1.4s ease-in-out infinite;
            border-radius: 10px;
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div className="sk" style={{ height: 12, width: 120, borderRadius: 6 }} />
              <div className="sk" style={{ height: 26, width: 100, borderRadius: 8 }} />
              <div className="sk" style={{ height: 14, width: 200, borderRadius: 6 }} />
            </div>
            <div className="sk" style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0 }} />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="sk" style={{ height: 130, borderRadius: 16 }} />
          ))}
          <div className="sk" style={{ height: 52, borderRadius: 13 }} />
        </div>
      </>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            INVENTÁRIO DIÁRIO
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>10° Passo</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.125rem' }}>
            Continuamos a fazer o inventário pessoal
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'var(--duo-purple)' }}>
          <ClipboardText size={22} weight="duotone" color="white" />
        </div>
      </div>

      {celebrar && (
        <div className="pop-in text-center py-3 rounded-2xl"
             style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Star size={20} weight="duotone" color="var(--success)" />
          <span className="text-sm ml-2 font-bold" style={{ color: 'var(--success)' }}>
            +25 pontos! Inventário feito!
          </span>
        </div>
      )}

      <div className="space-y-4">
        {PERGUNTAS.map(({ key, titulo, pergunta }) => (
          <div key={key} className="card space-y-3" style={{ borderBottom: '4px solid var(--border)', boxShadow: 'none' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(() => { const Icon = PERGUNTA_ICONS[key]; const color = PERGUNTA_COLORS[key]; return <Icon size={16} weight="duotone" color={color} /> })()}
              <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)' }}>{titulo}</p>
            </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>{pergunta}</p>
            </div>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Escreva aqui sua reflexão..."
              value={respostas[key as keyof typeof respostas]}
              onChange={e => setRespostas(prev => ({ ...prev, [key]: e.target.value }))}
              disabled={jaFez}
              style={{ resize: 'none', opacity: jaFez ? 0.7 : 1 }}
            />
          </div>
        ))}
      </div>

      {jaFez ? (
        <div className="flex items-center justify-center gap-2 py-4 rounded-2xl"
             style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle size={20} weight="bold" color="#22c55e" />
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--success)' }}>
            Inventário de hoje concluído!
          </span>
        </div>
      ) : (
        <button onClick={handleSalvar} disabled={salvando || !temAlgumaResposta} className="btn-primary">
          {salvando ? 'Salvando...' : 'Salvar inventário (+25 pts)'}
        </button>
      )}
    </div>
  )
}
