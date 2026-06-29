interface ItemBarra {
  label: string
  valor: number
  cor?: string
}

/**
 * Gráfico de barras horizontais (CSS puro, sem dependências).
 * Usado para o ranking de módulos mais/menos usados.
 */
export default function Barras({ itens }: { itens: ItemBarra[] }) {
  const max = Math.max(1, ...itens.map((i) => i.valor))
  const ordenados = [...itens].sort((a, b) => b.valor - a.valor)

  return (
    <div className="flex flex-col gap-3">
      {ordenados.map((item, idx) => {
        const pct = Math.round((item.valor / max) * 100)
        const cor = item.cor ?? 'var(--duo-blue)'
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-extrabold" style={{ color: 'var(--text-1)' }}>
                {idx === 0 && (
                  <span className="badge badge-green">Mais usado</span>
                )}
                {idx === ordenados.length - 1 && ordenados.length > 1 && item.valor < max && (
                  <span className="badge badge-orange">Menos usado</span>
                )}
                {item.label}
              </span>
              <span className="text-sm font-black" style={{ color: 'var(--text-2)' }}>
                {item.valor.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--duo-gray-light)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(pct, 3)}%`, background: cor }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
