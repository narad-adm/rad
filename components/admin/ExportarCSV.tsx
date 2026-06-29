'use client'

import { DownloadSimple } from '@phosphor-icons/react'
import type { UsuarioResumo } from '@/lib/admin/queries'

const COLUNAS: { chave: keyof UsuarioResumo; titulo: string }[] = [
  { chave: 'nome', titulo: 'Nome' },
  { chave: 'email', titulo: 'Email' },
  { chave: 'criado_em', titulo: 'Cadastro' },
  { chave: 'ultimo_acesso', titulo: 'Ultimo acesso' },
  { chave: 'total_acessos', titulo: 'Acessos' },
  { chave: 'streak_atual', titulo: 'Streak atual' },
  { chave: 'streak_maximo', titulo: 'Streak maximo' },
  { chave: 'total_checkins', titulo: 'Checkins' },
  { chave: 'total_leituras', titulo: 'Leituras' },
  { chave: 'total_respostas_passos', titulo: 'Respostas guia' },
  { chave: 'total_inventarios', titulo: 'Inventarios' },
  { chave: 'total_humores', titulo: 'Humores' },
]

function escapar(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function ExportarCSV({ usuarios }: { usuarios: UsuarioResumo[] }) {
  function baixar() {
    const cabecalho = COLUNAS.map((c) => c.titulo).join(';')
    const linhas = usuarios.map((u) =>
      COLUNAS.map((c) => escapar(u[c.chave])).join(';'),
    )
    const csv = '﻿' + [cabecalho, ...linhas].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rad-usuarios-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={baixar} className="btn-outline">
      <DownloadSimple size={20} weight="bold" />
      Exportar usuários (CSV)
    </button>
  )
}
