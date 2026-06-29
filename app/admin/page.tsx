import Link from 'next/link'
import {
  Users, UserCheck, CursorClick, Pulse, ArrowRight,
} from '@phosphor-icons/react/dist/ssr'
import {
  getResumoUsuarios, getMetricasModulos, getAcessosPorDia, calcularKpis,
} from '@/lib/admin/queries'
import { tempoRelativo, inativoHa } from '@/lib/admin/format'
import KpiCard from '@/components/admin/KpiCard'
import Barras from '@/components/admin/Barras'
import AcessosChart from '@/components/admin/AcessosChart'

export const dynamic = 'force-dynamic'

const DIAS_INATIVO = 7

export default async function VisaoGeralPage() {
  const [usuarios, modulos, acessos] = await Promise.all([
    getResumoUsuarios(),
    getMetricasModulos(),
    getAcessosPorDia(30),
  ])
  const kpis = calcularKpis(usuarios)

  const rankingModulos = [
    { label: 'Check-ins de reunião', valor: modulos.checkins, cor: 'var(--duo-blue)' },
    { label: 'Leituras (Só por Hoje)', valor: modulos.leituras, cor: 'var(--duo-green)' },
    { label: 'Respostas do guia', valor: modulos.respostas_passos, cor: 'var(--duo-purple)' },
    { label: 'Inventários (10º passo)', valor: modulos.inventarios, cor: 'var(--duo-orange)' },
    { label: 'Registros de humor', valor: modulos.humores, cor: 'var(--duo-pink)' },
  ]

  const inativos = usuarios
    .filter((u) => inativoHa(u.ultimo_acesso, DIAS_INATIVO))
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-black md:text-3xl" style={{ color: 'var(--text-1)' }}>
          Visão Geral
        </h1>
        <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
          Como os usuários estão usando o RAD
        </p>
      </header>

      {/* ── KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Usuários" valor={kpis.totalUsuarios} icon={Users} cor="var(--duo-blue)" />
        <KpiCard label="Ativos hoje" valor={kpis.ativosHoje}
          sub={`${kpis.ativos7d} em 7 dias`} icon={UserCheck} cor="var(--duo-green)" />
        <KpiCard label="Ativos 30 dias" valor={kpis.ativos30d} icon={Pulse} cor="var(--duo-purple)" />
        <KpiCard label="Acessos totais" valor={kpis.totalAcessos.toLocaleString('pt-BR')}
          icon={CursorClick} cor="var(--duo-orange)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Ranking de módulos ─────────────────────────── */}
        <section className="card">
          <h2 className="mb-1 text-lg font-black" style={{ color: 'var(--text-1)' }}>
            Módulos mais e menos usados
          </h2>
          <p className="mb-4 text-xs font-bold" style={{ color: 'var(--text-3)' }}>
            Total de interações por módulo (somente quantidades)
          </p>
          <Barras itens={rankingModulos} />
        </section>

        {/* ── Acessos por dia ────────────────────────────── */}
        <section className="card">
          <h2 className="mb-1 text-lg font-black" style={{ color: 'var(--text-1)' }}>
            Acessos por dia
          </h2>
          <p className="mb-4 text-xs font-bold" style={{ color: 'var(--text-3)' }}>
            Últimos 30 dias
          </p>
          <AcessosChart dados={acessos} />
        </section>
      </div>

      {/* ── Usuários inativos ────────────────────────────── */}
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>
              Usuários inativos
            </h2>
            <p className="text-xs font-bold" style={{ color: 'var(--text-3)' }}>
              Sem acesso há mais de {DIAS_INATIVO} dias
            </p>
          </div>
          <Link href="/admin/usuarios" className="flex items-center gap-1 text-sm font-extrabold"
            style={{ color: 'var(--duo-blue)' }}>
            Ver todos <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        {inativos.length === 0 ? (
          <p className="py-4 text-center text-sm font-bold" style={{ color: 'var(--duo-green-dark)' }}>
            🎉 Todos os usuários acessaram recentemente!
          </p>
        ) : (
          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {inativos.map((u) => (
              <li key={u.id}>
                <Link href={`/admin/usuarios/${u.id}`}
                  className="flex items-center justify-between py-2.5">
                  <span className="font-extrabold" style={{ color: 'var(--text-1)' }}>{u.nome}</span>
                  <span className="badge badge-orange">{tempoRelativo(u.ultimo_acesso)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
