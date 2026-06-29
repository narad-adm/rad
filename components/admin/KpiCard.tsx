import type { Icon } from '@phosphor-icons/react'

interface Props {
  label: string
  valor: string | number
  sub?: string
  icon: Icon
  cor?: string
}

/** Cartão de KPI no estilo visual do app (card + ícone colorido). */
export default function KpiCard({ label, valor, sub, icon: Icone, cor = 'var(--duo-blue)' }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: `color-mix(in srgb, ${cor} 14%, transparent)` }}
      >
        <Icone size={26} weight="fill" color={cor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black leading-none" style={{ color: 'var(--text-1)' }}>
          {valor}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
          {label}
        </p>
        {sub && (
          <p className="text-xs font-bold" style={{ color: 'var(--text-2)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
