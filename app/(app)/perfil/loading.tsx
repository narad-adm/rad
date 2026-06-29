export default function PerfilLoading() {
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
        {/* Avatar + nome */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
          <div className="sk" style={{ width: 80, height: 80, borderRadius: '50%' }} />
          <div className="sk" style={{ height: 20, width: 140, borderRadius: 8 }} />
          <div className="sk" style={{ height: 14, width: 100, borderRadius: 6 }} />
        </div>

        {/* Cards de stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sk" style={{ height: 80, borderRadius: 16 }} />
          ))}
        </div>

        {/* Itens de configuração */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="sk" style={{ height: 56, borderRadius: 14 }} />
        ))}
      </div>
    </>
  )
}
