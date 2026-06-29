import { BellRinging } from '@phosphor-icons/react/dist/ssr'
import {
  getResumoUsuarios, getUsuariosComPush, getHistoricoNotificacoes,
} from '@/lib/admin/queries'
import { dataCurta } from '@/lib/admin/format'
import EnviarNotificacaoForm from '@/components/admin/EnviarNotificacaoForm'

export const dynamic = 'force-dynamic'

export default async function NotificacoesPage() {
  const [usuarios, comPush, historico] = await Promise.all([
    getResumoUsuarios(),
    getUsuariosComPush(),
    getHistoricoNotificacoes(20),
  ])

  const opcoes = usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    temPush: comPush.has(u.id),
  }))

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-black md:text-3xl" style={{ color: 'var(--text-1)' }}>
          Notificações
        </h1>
        <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
          Dispare avisos para todos ou para um usuário específico
        </p>
      </header>

      <EnviarNotificacaoForm usuarios={opcoes} />

      {/* ── Histórico ────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-lg font-black" style={{ color: 'var(--text-1)' }}>
          Histórico
        </h2>
        {historico.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 py-8 text-center">
            <BellRinging size={32} weight="fill" color="var(--text-3)" />
            <p className="font-bold" style={{ color: 'var(--text-3)' }}>
              Nenhuma notificação enviada ainda.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {historico.map((n) => (
              <li key={n.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-extrabold" style={{ color: 'var(--text-1)' }}>{n.titulo}</p>
                    <p className="text-sm" style={{ color: 'var(--text-2)' }}>{n.corpo}</p>
                  </div>
                  <span className="badge badge-green shrink-0">{n.total_enviado} envio(s)</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold"
                  style={{ color: 'var(--text-3)' }}>
                  <span className="badge badge-blue">{n.alvo_nome ?? (n.alvo === 'todos' ? 'Todos' : 'Usuário')}</span>
                  <span>{dataCurta(n.criado_em)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
