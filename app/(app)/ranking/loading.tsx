export default function RankingLoading() {
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Header */}
        <div className="sk" style={{ height: 14, width: 100, borderRadius: 6, marginBottom: '0.25rem' }} />

        {/* Pódio top 3 */}
        <div className="sk" style={{ height: 140, borderRadius: 20, marginBottom: '0.5rem' }} />

        {/* Lista de posições */}
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sk" style={{ width: 28, height: 20, borderRadius: 6, flexShrink: 0 }} />
            <div className="sk" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div className="sk" style={{ height: 14, width: '60%', borderRadius: 6 }} />
              <div className="sk" style={{ height: 12, width: '35%', borderRadius: 6 }} />
            </div>
            <div className="sk" style={{ width: 48, height: 20, borderRadius: 6, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </>
  )
}
