'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartLineUp,
  Users,
  BellRinging,
  Gear,
  ArrowLeft,
} from '@phosphor-icons/react'

const ITENS = [
  { href: '/admin', label: 'Visão Geral', icon: ChartLineUp },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/notificacoes', label: 'Notificações', icon: BellRinging },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Gear },
]

function ativo(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        {/* ── Sidebar (desktop) ───────────────────────────── */}
        <aside className="hidden md:flex md:w-60 md:flex-col md:gap-2 md:border-r md:p-4"
          style={{ borderColor: 'var(--border)', minHeight: '100vh' }}>
          <div className="mb-4 px-2 pt-2">
            <p className="text-2xl font-black" style={{ color: 'var(--text-1)' }}>
              RAD <span style={{ color: 'var(--duo-blue)' }}>Admin</span>
            </p>
            <p className="text-xs font-bold" style={{ color: 'var(--text-3)' }}>
              Painel de controle
            </p>
          </div>

          {ITENS.map(({ href, label, icon: Icon }) => {
            const on = ativo(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 font-extrabold transition"
                style={{
                  background: on ? 'rgba(28,176,246,0.1)' : 'transparent',
                  color: on ? 'var(--duo-blue)' : 'var(--text-2)',
                }}
              >
                <Icon size={22} weight={on ? 'fill' : 'regular'} />
                {label}
              </Link>
            )
          })}

          <Link
            href="/dashboard"
            className="mt-auto flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition"
            style={{ color: 'var(--text-3)' }}
          >
            <ArrowLeft size={18} /> Voltar ao app
          </Link>
        </aside>

        {/* ── Top bar + tabs (mobile) ─────────────────────── */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 md:hidden"
            style={{
              background: 'var(--bg-card)',
              borderBottom: '2px solid var(--border)',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-lg font-black" style={{ color: 'var(--text-1)' }}>
                RAD <span style={{ color: 'var(--duo-blue)' }}>Admin</span>
              </p>
              <Link href="/dashboard" className="text-xs font-bold"
                style={{ color: 'var(--text-3)' }}>
                Voltar ao app
              </Link>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
              {ITENS.map(({ href, label, icon: Icon }) => {
                const on = ativo(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition"
                    style={{
                      background: on ? 'rgba(28,176,246,0.1)' : 'var(--bg-card-2)',
                      color: on ? 'var(--duo-blue)' : 'var(--text-2)',
                    }}
                  >
                    <Icon size={18} weight={on ? 'fill' : 'regular'} />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </header>

          <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
