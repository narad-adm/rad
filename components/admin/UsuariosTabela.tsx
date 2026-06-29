'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlass, CaretUpDown } from '@phosphor-icons/react'
import type { UsuarioResumo } from '@/lib/admin/queries'
import { tempoRelativo, diasLimpo } from '@/lib/admin/format'

type Coluna =
  | 'nome' | 'ultimo_acesso' | 'total_acessos' | 'streak_atual'
  | 'total_checkins' | 'total_leituras' | 'total_respostas_passos'
  | 'total_inventarios'

const COLUNAS_NUM: { chave: Coluna; label: string; titulo: string }[] = [
  { chave: 'total_acessos', label: 'Acessos', titulo: 'Total de acessos' },
  { chave: 'streak_atual', label: 'Streak', titulo: 'Streak atual' },
  { chave: 'total_checkins', label: 'Check-ins', titulo: 'Check-ins de reunião' },
  { chave: 'total_leituras', label: 'Leituras', titulo: 'Leituras Só por Hoje' },
  { chave: 'total_respostas_passos', label: 'Guia', titulo: 'Respostas do guia dos passos' },
  { chave: 'total_inventarios', label: 'Invent.', titulo: 'Inventários (10º passo)' },
]

export default function UsuariosTabela({ usuarios }: { usuarios: UsuarioResumo[] }) {
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Coluna>('ultimo_acesso')
  const [asc, setAsc] = useState(false)

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const arr = usuarios.filter(
      (u) =>
        !q ||
        u.nome?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    )
    arr.sort((a, b) => {
      let va: number | string = a[ordem] ?? 0
      let vb: number | string = b[ordem] ?? 0
      if (ordem === 'nome') {
        va = (a.nome ?? '').toLowerCase()
        vb = (b.nome ?? '').toLowerCase()
      } else if (ordem === 'ultimo_acesso') {
        va = a.ultimo_acesso ? new Date(a.ultimo_acesso).getTime() : 0
        vb = b.ultimo_acesso ? new Date(b.ultimo_acesso).getTime() : 0
      }
      if (va < vb) return asc ? -1 : 1
      if (va > vb) return asc ? 1 : -1
      return 0
    })
    return arr
  }, [usuarios, busca, ordem, asc])

  function alternar(col: Coluna) {
    if (ordem === col) setAsc(!asc)
    else {
      setOrdem(col)
      setAsc(false)
    }
  }

  return (
    <div>
      <div className="relative mb-4">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-3)' }}
        />
        <input
          className="input-field pl-10"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* ── Desktop: tabela ─────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <Th onClick={() => alternar('nome')} ativo={ordem === 'nome'}>Usuário</Th>
              <Th onClick={() => alternar('ultimo_acesso')} ativo={ordem === 'ultimo_acesso'}>Último acesso</Th>
              {COLUNAS_NUM.map((c) => (
                <Th key={c.chave} onClick={() => alternar(c.chave)} ativo={ordem === c.chave} centro title={c.titulo}>
                  {c.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u) => (
              <tr key={u.id} className="transition hover:bg-[var(--bg-card-2)]"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-3 pr-4">
                  <Link href={`/admin/usuarios/${u.id}`} className="block">
                    <p className="font-extrabold" style={{ color: 'var(--text-1)' }}>{u.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{u.email ?? '—'}</p>
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-bold" style={{ color: 'var(--text-2)' }}>
                    {tempoRelativo(u.ultimo_acesso)}
                  </span>
                </td>
                {COLUNAS_NUM.map((c) => (
                  <td key={c.chave} className="py-3 text-center font-extrabold"
                    style={{ color: 'var(--text-1)' }}>
                    {(u[c.chave] as number) ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <Vazio />}
      </div>

      {/* ── Mobile: cards ───────────────────────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtrados.map((u) => (
          <Link key={u.id} href={`/admin/usuarios/${u.id}`} className="card block">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate font-extrabold" style={{ color: 'var(--text-1)' }}>{u.nome}</p>
                <p className="truncate text-xs" style={{ color: 'var(--text-3)' }}>{u.email ?? '—'}</p>
              </div>
              <span className="badge badge-blue shrink-0">{tempoRelativo(u.ultimo_acesso)}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Mini label="Acessos" valor={u.total_acessos} />
              <Mini label="Streak" valor={u.streak_atual} />
              <Mini label="Dias limpo" valor={diasLimpo(u.data_limpeza)} />
              <Mini label="Check-ins" valor={u.total_checkins} />
              <Mini label="Guia" valor={u.total_respostas_passos} />
              <Mini label="Invent." valor={u.total_inventarios} />
            </div>
          </Link>
        ))}
        {filtrados.length === 0 && <Vazio />}
      </div>
    </div>
  )
}

function Th({
  children, onClick, ativo, centro, title,
}: {
  children: React.ReactNode; onClick: () => void; ativo: boolean; centro?: boolean; title?: string
}) {
  return (
    <th
      onClick={onClick}
      title={title}
      className={`cursor-pointer select-none whitespace-nowrap pb-2 text-xs font-black uppercase tracking-wide ${centro ? 'text-center' : 'text-left'}`}
      style={{ color: ativo ? 'var(--duo-blue)' : 'var(--text-3)' }}
    >
      <span className={`inline-flex items-center gap-1 ${centro ? 'justify-center' : ''}`}>
        {children}
        <CaretUpDown size={12} />
      </span>
    </th>
  )
}

function Mini({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-xl py-2" style={{ background: 'var(--bg-card-2)' }}>
      <p className="text-base font-black" style={{ color: 'var(--text-1)' }}>{valor ?? 0}</p>
      <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-3)' }}>{label}</p>
    </div>
  )
}

function Vazio() {
  return (
    <p className="py-8 text-center font-bold" style={{ color: 'var(--text-3)' }}>
      Nenhum usuário encontrado.
    </p>
  )
}
