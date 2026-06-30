import Link from 'next/link'
import { Flask, ShieldCheck, Database, ArrowSquareOut, MegaphoneSimple } from '@phosphor-icons/react/dist/ssr'
import { getResumoUsuarios, getBannersAdmin } from '@/lib/admin/queries'
import { ADMIN_EMAIL } from '@/lib/admin-auth'
import ExportarCSV from '@/components/admin/ExportarCSV'
import GerenciarBanner from '@/components/admin/GerenciarBanner'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const [usuarios, banners] = await Promise.all([
    getResumoUsuarios(),
    getBannersAdmin(),
  ])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-black md:text-3xl" style={{ color: 'var(--text-1)' }}>
          Configurações
        </h1>
        <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
          Acesso, dados e ferramentas do painel
        </p>
      </header>

      {/* ── Acesso ───────────────────────────────────────── */}
      <section className="card">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={22} weight="fill" color="var(--duo-green)" />
          <h2 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>Acesso</h2>
        </div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-2)' }}>
          O painel é restrito a um único administrador:
        </p>
        <p className="mt-1 font-extrabold" style={{ color: 'var(--duo-blue)' }}>{ADMIN_EMAIL}</p>
        <p className="mt-2 text-xs font-bold" style={{ color: 'var(--text-3)' }}>
          Qualquer outro usuário é redirecionado automaticamente para o app.
        </p>
      </section>

      {/* ── Banner Global ─────────────────────────────────── */}
      <section className="card">
        <div className="mb-3 flex items-center gap-2">
          <MegaphoneSimple size={22} weight="fill" color="var(--duo-blue)" />
          <h2 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>Banner global</h2>
        </div>
        <p className="mb-4 text-sm font-bold" style={{ color: 'var(--text-2)' }}>
          Exibe uma mensagem no topo do app para todos os usuários.
          Útil para avisos de manutenção, atualizações ou recados gerais.
        </p>
        <GerenciarBanner banners={banners} />
      </section>

      {/* ── Dados ────────────────────────────────────────── */}
      <section className="card">
        <div className="mb-2 flex items-center gap-2">
          <Database size={22} weight="fill" color="var(--duo-purple)" />
          <h2 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>Dados</h2>
        </div>
        <p className="mb-3 text-sm font-bold" style={{ color: 'var(--text-2)' }}>
          Exporte a base de {usuarios.length} usuário(s) com todas as métricas para análise externa.
        </p>
        <ExportarCSV usuarios={usuarios} />
      </section>

      {/* ── Ferramentas ──────────────────────────────────── */}
      <section className="card">
        <div className="mb-2 flex items-center gap-2">
          <Flask size={22} weight="fill" color="var(--duo-orange)" />
          <h2 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>Ferramentas</h2>
        </div>
        <Link href="/admin/testar-notificacao"
          className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[var(--bg-card-2)]"
          style={{ border: '2px solid var(--border)' }}>
          <span className="font-extrabold" style={{ color: 'var(--text-1)' }}>
            Testar notificação no seu dispositivo
          </span>
          <ArrowSquareOut size={18} weight="bold" color="var(--text-3)" />
        </Link>
      </section>
    </div>
  )
}
