export default function RelatoriosLoading() {
  return (
    <>
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .sk {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-2) 50%, var(--bg-card) 75%);
          background-size: 200% 100%;
          animation: sk-shimmer 1.4s ease-in-out infinite;
          border-radius: 10px;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header */}
        <div className="sk" style={{ height: 60, borderRadius: 20 }} />

        {/* Cards de stats — linha com 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="sk" style={{ height: 80, borderRadius: 16 }} />
          ))}
        </div>

        {/* Gráfico / card grande */}
        <div className="sk" style={{ height: 180, borderRadius: 20 }} />

        {/* Lista de entradas */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="sk" style={{ height: 64, borderRadius: 16 }} />
        ))}
      </div>
    </>
  )
}
