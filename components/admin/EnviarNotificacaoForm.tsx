'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaperPlaneTilt, CheckCircle, WarningCircle } from '@phosphor-icons/react'

interface UsuarioOpcao {
  id: string
  nome: string
  temPush: boolean
}

export default function EnviarNotificacaoForm({ usuarios }: { usuarios: UsuarioOpcao[] }) {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [url, setUrl] = useState('')
  const [alvo, setAlvo] = useState('todos')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  const comPush = usuarios.filter((u) => u.temPush).length

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !corpo.trim()) return
    setEnviando(true)
    setResultado(null)
    try {
      const res = await fetch('/api/admin/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          corpo: corpo.trim(),
          url: url.trim() || undefined,
          usuario_id: alvo === 'todos' ? undefined : alvo,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Falha ao enviar')
      setResultado({ ok: true, msg: `Enviado para ${data.sent} dispositivo(s).` })
      setTitulo('')
      setCorpo('')
      setUrl('')
      router.refresh()
    } catch (err) {
      setResultado({ ok: false, msg: err instanceof Error ? err.message : 'Erro inesperado.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="card flex flex-col gap-4">
      <div>
        <label className="label">Título</label>
        <input
          className="input-field"
          placeholder="Ex.: Bom dia! 🌅"
          value={titulo}
          maxLength={80}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Conteúdo</label>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Mensagem que aparecerá na notificação…"
          value={corpo}
          maxLength={300}
          onChange={(e) => setCorpo(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Destinatário</label>
          <select className="input-field" value={alvo} onChange={(e) => setAlvo(e.target.value)}>
            <option value="todos">Todos os usuários ({comPush} com push)</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id} disabled={!u.temPush}>
                {u.nome}{u.temPush ? '' : ' (sem push)'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Abrir ao clicar (opcional)</label>
          <input
            className="input-field"
            placeholder="/dashboard"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      {resultado && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold"
          style={{
            background: resultado.ok ? 'var(--duo-green-bg)' : 'rgba(255,75,75,0.12)',
            color: resultado.ok ? 'var(--duo-green-dark)' : 'var(--danger)',
          }}
        >
          {resultado.ok ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
          {resultado.msg}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={enviando || !titulo.trim() || !corpo.trim()}
      >
        <PaperPlaneTilt size={20} weight="fill" />
        {enviando ? 'Enviando…' : 'Disparar notificação'}
      </button>
    </form>
  )
}
