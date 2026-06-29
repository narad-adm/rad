export default function DashboardLoading() {
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

        {/* Saudação + dias limpo */}
        <div className="sk" style={{ height: 110, borderRadius: 20 }} />

        {/* Progresso do dia */}
        <div className="sk" style={{ height: 80, borderRadius: 20 }} />

        {/* Cards de atividade — grid 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sk" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>

        {/* Card de humor */}
        <div className="sk" style={{ height: 80, borderRadius: 20 }} />
      </div>
    </>
  )
}
