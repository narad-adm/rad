import { Users, BookOpen, ListChecks, NotePencil, Smiley } from '@phosphor-icons/react/dist/ssr'
import type { TimelineUsuario } from '@/lib/admin/queries'
import { tempoRelativo } from '@/lib/admin/format'

interface Props {
  timeline: TimelineUsuario
}

const MODULOS = [
  { chave: 'ultimo_checkin' as const,   label: 'Check-in de reunião',   icon: Users,      cor: 'var(--duo-blue)'   },
  { chave: 'ultima_leitura' as const,   label: 'Leitura (Só por Hoje)', icon: BookOpen,   cor: 'var(--duo-green)'  },
  { chave: 'ultima_resposta' as const,  label: 'Resposta do guia',      icon: ListChecks, cor: 'var(--duo-purple)' },
  { chave: 'ultimo_inventario' as const,label: 'Inventário (10º passo)',icon: NotePencil, cor: 'var(--duo-orange)' },
  { chave: 'ultimo_humor' as const,     label: 'Registro de humor',     icon: Smiley,     cor: 'var(--duo-pink)'   },
]

export default function TimelineAtividade({ timeline }: Props) {
  return (
    <section className="card">
      <h2 className="mb-1 text-lg font-black" style={{ color: 'var(--text-1)' }}>
        Última atividade por módulo
      </h2>
      <p className="mb-4 text-xs font-bold" style={{ color: 'var(--text-3)' }}>
        Quando o usuário usou cada funcionalidade pela última vez
      </p>
      <ul className="flex flex-col gap-2">
        {MODULOS.map((m) => (
          <li
            key={m.chave}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: 'var(--bg-card-2)' }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `color-mix(in srgb, ${m.cor} 14%, transparent)` }}
            >
              <m.icon size={18} weight="fill" color={m.cor} />
            </div>
            <span className="flex-1 font-bold" style={{ color: 'var(--text-2)' }}>{m.label}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
              {tempoRelativo(timeline[m.chave])}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
