import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, CalendarBlank, Clock, Fire, CursorClick,
  Users, BookOpen, ListChecks, NotePencil, Smiley,
} from '@phosphor-icons/react/dist/ssr'
import { getUsuarioResumo } from '@/lib/admin/queries'
import { tempoRelativo, dataCurta, diasLimpo } from '@/lib/admin/format'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function UsuarioDetalhePage({ params }: { params: Params }) {
  const { id } = await params
  const u = await getUsuarioResumo(id)
  if (!u) notFound()

  const atividades = [
    { label: 'Check-ins de reunião', valor: u.total_checkins, icon: Users, cor: 'var(--duo-blue)' },
    { label: 'Leituras (Só por Hoje)', valor: u.total_leituras, icon: BookOpen, cor: 'var(--duo-green)' },
    { label: 'Respostas do guia', valor: u.total_respostas_passos, icon: ListChecks, cor: 'var(--duo-purple)' },
    { label: 'Inventários (10º passo)', valor: u.total_inventarios, icon: NotePencil, cor: 'var(--duo-orange)' },
    { label: 'Registros de humor', valor: u.total_humores, icon: Smiley, cor: 'var(--duo-pink)' },
  ]

  const meta = [
    { label: 'Cadastro', valor: dataCurta(u.criado_em), icon: CalendarBlank },
    { label: 'Último acesso', valor: tempoRelativo(u.ultimo_acesso), icon: Clock },
    { label: 'Total de acessos', valor: String(u.total_acessos), icon: CursorClick },
    { label: 'Streak atual', valor: `${u.streak_atual} dias`, icon: Fire },
  ]

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/usuarios" className="flex items-center gap-1 text-sm font-extrabold"
        style={{ color: 'var(--text-3)' }}>
        <ArrowLeft size={16} weight="bold" /> Usuários
      </Link>

      <header className="card">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-1)' }}>{u.nome}</h1>
        <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>{u.email ?? '—'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="badge badge-blue">{diasLimpo(u.data_limpeza)} dias limpo</span>
          <span className="badge badge-orange">Recorde: {u.streak_maximo} dias</span>
        </div>
      </header>

      {/* ── Metadados de acesso ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {meta.map((m) => (
          <div key={m.label} className="card">
            <m.icon size={22} weight="fill" color="var(--duo-blue)" />
            <p className="mt-2 text-lg font-black" style={{ color: 'var(--text-1)' }}>{m.valor}</p>
            <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-3)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Atividade por módulo (quantidades) ───────────── */}
      <section className="card">
        <h2 className="mb-1 text-lg font-black" style={{ color: 'var(--text-1)' }}>
          Atividade por módulo
        </h2>
        <p className="mb-4 text-xs font-bold" style={{ color: 'var(--text-3)' }}>
          Apenas quantidades — o conteúdo das respostas é privado e não é exibido
        </p>
        <ul className="flex flex-col gap-2">
          {atividades.map((a) => (
            <li key={a.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg-card-2)' }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in srgb, ${a.cor} 14%, transparent)` }}>
                <a.icon size={18} weight="fill" color={a.cor} />
              </div>
              <span className="flex-1 font-bold" style={{ color: 'var(--text-2)' }}>{a.label}</span>
              <span className="text-lg font-black" style={{ color: 'var(--text-1)' }}>{a.valor}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
