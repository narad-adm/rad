export default function PassosLoading() {
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
        {/* Título da seção */}
        <div className="sk" style={{ height: 14, width: 120, borderRadius: 6, marginBottom: '0.25rem' }} />

        {/* 12 cards de passo */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="sk" style={{ height: 72, borderRadius: 16 }} />
        ))}
      </div>
    </>
  )
}
