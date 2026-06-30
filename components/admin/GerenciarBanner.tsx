'use client'
import { useState } from 'react'
import { MegaphoneSimple, X } from '@phosphor-icons/react'
import type { BannerAdmin } from '@/lib/admin/queries'

interface Props {
  banners: BannerAdmin[]
}

const TIPOS: Record<string, { cor: string; label: string }> = {
  info:  { cor: 'var(--duo-blue)',   label: 'Informativo' },
  aviso: { cor: 'var(--duo-orange)', label: 'Aviso'       },
  erro:  { cor: '#ef4444',           label: 'Urgente'     },
}

export default function GerenciarBanner({ banners: inicial }: Props) {
  const [banners, setBanners] = useState<BannerAdmin[]>(inicial)
  const [mensagem, setMensagem] = useState('')
  const [tipo, setTipo] = useState('info')
  const [loading, setLoading] = useState(false)

  const ativo = banners.find(b => b.ativo)

  async function publicar() {
    if (!mensagem.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem, tipo }),
      })
      const novo = await res.json()
      setBanners(b => [
        { ...novo, ativo: true } as BannerAdmin,
        ...b.map(x => ({ ...x, ativo: false })),
      ])
      setMensagem('')
    } finally {
      setLoading(false)
    }
  }

  async function desativar(id: string) {
    await fetch(`/api/admin/banner/${id}`, { method: 'PATCH' })
    setBanners(b => b.map(x => x.id === id ? { ...x, ativo: false } : x))
  }

  async function deletar(id: string) {
    if (!confirm('Remover este banner?')) return
    await fetch(`/api/admin/banner/${id}`, { method: 'DELETE' })
    setBanners(b => b.filter(x => x.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status atual */}
      {ativo ? (
        <div className="rounded-xl p-3" style={{
          background: 'color-mix(in srgb, var(--duo-orange) 12%, transparent)',
          border: '2px solid var(--duo-orange)',
        }}>
          <p className="text-xs font-black uppercase mb-1" style={{ color: 'var(--duo-orange)' }}>
            Banner ativo agora
          </p>
          <p className="font-bold" style={{ color: 'var(--text-1)' }}>{ativo.mensagem}</p>
          <button onClick={() => desativar(ativo.id)} className="btn-ghost mt-2 text-sm">
            Desativar banner
          </button>
        </div>
      ) : (
        <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
          Nenhum banner ativo no momento.
        </p>
      )}

      {/* Criar novo */}
      <div className="flex flex-col gap-2">
        <label className="label">Nova mensagem de banner</label>
        <textarea
          className="input-field"
          rows={2}
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          placeholder="Ex: O app estará em manutenção às 22h por 30 minutos."
        />
        <div className="flex gap-2 flex-wrap">
          {Object.entries(TIPOS).map(([t, { cor, label }]) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              style={{
                padding: '6px 14px', borderRadius: 10, border: 'none',
                fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '0.8rem',
                cursor: 'pointer',
                background: tipo === t ? cor : 'var(--bg-card-2)',
                color: tipo === t ? 'white' : 'var(--text-2)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={publicar}
          disabled={loading || !mensagem.trim()}
          className="btn-primary"
        >
          <MegaphoneSimple size={18} weight="bold" />
          {loading ? 'Publicando...' : 'Publicar banner'}
        </button>
      </div>

      {/* Histórico */}
      {banners.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase mb-2" style={{ color: 'var(--text-3)' }}>
            Histórico
          </p>
          <ul className="flex flex-col gap-2">
            {banners.map(b => (
              <li
                key={b.id}
                className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: 'var(--bg-card-2)', opacity: b.ativo ? 1 : 0.55 }}
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: b.ativo ? 'var(--duo-green)' : 'var(--text-3)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold break-words" style={{ color: 'var(--text-1)' }}>
                    {b.mensagem}
                  </p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {TIPOS[b.tipo]?.label ?? b.tipo}
                    {b.ativo && <span style={{ color: 'var(--duo-green)' }}> · ativo</span>}
                  </p>
                </div>
                <button
                  onClick={() => deletar(b.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                >
                  <X size={14} weight="bold" color="var(--text-3)" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
