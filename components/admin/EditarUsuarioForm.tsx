'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FloppyDisk, LockKey, Warning, Trash } from '@phosphor-icons/react'

interface Props {
  id: string
  nome: string
  dataLimpeza: string
  streakAtual: number
  streakMaximo: number
  desativado: boolean
}

type Msg = { tipo: 'ok' | 'erro'; texto: string }

export default function EditarUsuarioForm({
  id, nome, dataLimpeza, streakAtual, streakMaximo, desativado,
}: Props) {
  const router = useRouter()
  const [campos, setCampos] = useState({ nome, dataLimpeza, streakAtual, streakMaximo })
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<Msg | null>(null)
  const [linkReset, setLinkReset] = useState<string | null>(null)
  const [loadingReset, setLoadingReset] = useState(false)
  const [loadingToggle, setLoadingToggle] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)

  async function salvar() {
    setSalvando(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/usuario/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: campos.nome,
          data_limpeza: campos.dataLimpeza,
          streak_atual: campos.streakAtual,
          streak_maximo: campos.streakMaximo,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setMsg({ tipo: 'ok', texto: 'Dados salvos com sucesso.' })
      router.refresh()
    } catch (e) {
      setMsg({ tipo: 'erro', texto: (e as Error).message })
    } finally {
      setSalvando(false)
    }
  }

  async function toggleDesativado() {
    setLoadingToggle(true)
    try {
      const res = await fetch(`/api/admin/usuario/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desativado: !desativado }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.refresh()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoadingToggle(false)
    }
  }

  async function gerarLinkReset() {
    setLoadingReset(true)
    setLinkReset(null)
    try {
      const res = await fetch(`/api/admin/usuario/${id}/senha`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setLinkReset(json.link)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoadingReset(false)
    }
  }

  async function deletarConta() {
    if (!confirm(
      'Tem certeza? Esta ação é IRREVERSÍVEL e apagará permanentemente todos os dados do usuário.'
    )) return
    setLoadingDelete(true)
    try {
      const res = await fetch(`/api/admin/usuario/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      router.push('/admin/usuarios')
    } catch (e) {
      alert((e as Error).message)
      setLoadingDelete(false)
    }
  }

  return (
    <section className="card flex flex-col gap-4">
      <h2 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>Editar dados</h2>

      {/* Campos editáveis */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="label">Nome</label>
          <input
            className="input-field"
            value={campos.nome}
            onChange={e => setCampos(c => ({ ...c, nome: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Data de início da recuperação</label>
          <input
            type="date"
            className="input-field"
            value={campos.dataLimpeza}
            onChange={e => setCampos(c => ({ ...c, dataLimpeza: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Streak atual</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={campos.streakAtual}
              onChange={e => setCampos(c => ({ ...c, streakAtual: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Streak máximo (recorde)</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={campos.streakMaximo}
              onChange={e => setCampos(c => ({ ...c, streakMaximo: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {msg && (
        <p className="text-sm font-bold" style={{ color: msg.tipo === 'ok' ? 'var(--duo-green)' : '#ef4444' }}>
          {msg.texto}
        </p>
      )}

      <button onClick={salvar} disabled={salvando} className="btn-primary">
        <FloppyDisk size={18} weight="bold" />
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Redefinição de senha */}
      <div className="flex flex-col gap-2">
        <button onClick={gerarLinkReset} disabled={loadingReset} className="btn-ghost">
          <LockKey size={18} weight="bold" />
          {loadingReset ? 'Gerando link...' : 'Gerar link de redefinição de senha'}
        </button>
        {linkReset && (
          <div className="rounded-xl p-3" style={{ background: 'var(--bg-card-2)', border: '1.5px solid var(--border)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-3)' }}>
              Copie e envie ao usuário (válido por 24h):
            </p>
            <input
              readOnly
              value={linkReset}
              className="input-field"
              style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}
              onFocus={e => e.target.select()}
            />
          </div>
        )}
      </div>

      {/* Desativar / reativar */}
      <button
        onClick={toggleDesativado}
        disabled={loadingToggle}
        style={{
          width: '100%', height: 48, borderRadius: 13, border: 'none',
          borderBottom: `4px solid ${desativado ? 'var(--duo-green-dark)' : '#c2410c'}`,
          background: desativado ? 'var(--duo-green)' : 'var(--duo-orange)',
          color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
          cursor: loadingToggle ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: loadingToggle ? 0.7 : 1,
        }}
      >
        <Warning size={18} weight="bold" />
        {loadingToggle ? 'Aguarde...' : desativado ? 'Reativar conta' : 'Desativar conta'}
      </button>

      {/* Deletar conta */}
      <button
        onClick={deletarConta}
        disabled={loadingDelete}
        style={{
          width: '100%', height: 48, borderRadius: 13, border: 'none',
          borderBottom: '4px solid #b91c1c',
          background: '#ef4444',
          color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
          cursor: loadingDelete ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: loadingDelete ? 0.7 : 1,
        }}
      >
        <Trash size={18} weight="bold" />
        {loadingDelete ? 'Deletando...' : 'Deletar conta permanentemente'}
      </button>
    </section>
  )
}
