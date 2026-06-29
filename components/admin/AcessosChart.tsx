'use client'

import type { AcessoPorDia } from '@/lib/admin/queries'

/**
 * Gráfico de colunas (CSS puro) de acessos por dia.
 * Mostra rótulos a cada ~5 dias para não poluir no mobile.
 */
export default function AcessosChart({ dados }: { dados: AcessoPorDia[] }) {
  const max = Math.max(1, ...dados.map((d) => d.total))
  const total = dados.reduce((s, d) => s + d.total, 0)

  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {dados.map((d) => {
          const altura = (d.total / max) * 100
          const data = new Date(d.dia + 'T00:00:00')
          const rotulo = `${data.getDate()}/${data.getMonth() + 1}`
          return (
            <div key={d.dia} className="group flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
              <div
                className="w-full rounded-t transition-all group-hover:opacity-80"
                style={{
                  height: `${Math.max(altura, d.total > 0 ? 6 : 1)}%`,
                  minHeight: 2,
                  background: d.total > 0 ? 'var(--duo-blue)' : 'var(--duo-gray-light)',
                }}
                title={`${rotulo}: ${d.total} acesso(s)`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>
        {dados.map((d, i) => {
          if (i % 5 !== 0 && i !== dados.length - 1) return <span key={d.dia} className="flex-1" />
          const data = new Date(d.dia + 'T00:00:00')
          return (
            <span key={d.dia} className="flex-1 text-center">
              {data.getDate()}/{data.getMonth() + 1}
            </span>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs font-bold" style={{ color: 'var(--text-2)' }}>
        {total.toLocaleString('pt-BR')} acessos nos últimos {dados.length} dias
      </p>
    </div>
  )
}
