'use client'
import { useState } from 'react'

interface Usuario { id: string; nome: string }

const PRESETS = [
  {
    label: 'Bom dia (08:00)',
    titulo: 'Bom dia! ☀️',
    corpo: 'Que tal começar o dia com a leitura do Só por Hoje?',
  },
  {
    label: 'Check-in (19:30)',
    titulo: 'Vai pegar uma reunião hoje?',
    corpo: 'Não esqueça de fazer o check-in antes de começar!',
  },
]

export default function TestarNotificacaoClient({ usuarios }: { usuarios: Usuario[] }) {
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ sent?: number; stale?: number; error?: string } | null>(null)

  function aplicarPreset(preset: typeof PRESETS[0]) {
    setTitulo(preset.titulo)
    setCorpo(preset.corpo)
  }

  async function enviar() {
    if (!titulo || !corpo) return
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch('/api/admin/testar-notificacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, corpo, usuario_id: usuarioId || undefined }),
      })
      const data = await res.json()
      setResultado(data)
    } catch {
      setResultado({ error: 'Falha na requisição' })
    } finally {
      setLoading(false)
    }
  }

  const label: Record<string, string> = {
    color: 'var(--fg)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '6px',
    display: 'block',
  } as unknown as Record<string, string>

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: 'var(--fg)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Testar Notificações</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => aplicarPreset(p)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', fontSize: 13 }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={label as React.CSSProperties}>Título</label>
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Título da notificação"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 15, boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={label as React.CSSProperties}>Corpo</label>
        <textarea
          value={corpo}
          onChange={e => setCorpo(e.target.value)}
          placeholder="Texto da notificação"
          rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 15, boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={label as React.CSSProperties}>Destinatário (opcional)</label>
        <select
          value={usuarioId}
          onChange={e => setUsuarioId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 15, boxSizing: 'border-box' }}
        >
          <option value="">Todos os usuários</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>

      <button
        onClick={enviar}
        disabled={loading || !titulo || !corpo}
        style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: loading ? '#aaa' : '#1CB0F6', color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Enviando…' : 'Enviar notificação'}
      </button>

      {resultado && (
        <div style={{
          marginTop: 20, padding: '14px 16px', borderRadius: 10,
          background: resultado.error ? '#fee2e2' : '#dcfce7',
          fontSize: 14,
        }}>
          {resultado.error
            ? `Erro: ${resultado.error}`
            : `Enviado: ${resultado.sent} · Stale removidos: ${resultado.stale}`}
        </div>
      )}
    </div>
  )
}
