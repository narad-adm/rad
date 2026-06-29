export default function ReuniaoLoading() {
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
        {/* Header card */}
        <div className="sk" style={{ height: 90, borderRadius: 20 }} />

        {/* Campos do formulário */}
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="sk" style={{ height: 12, width: 100, borderRadius: 6 }} />
            <div className="sk" style={{ height: 52, borderRadius: 13 }} />
          </div>
        ))}

        {/* Botão registrar */}
        <div className="sk" style={{ height: 52, borderRadius: 13, marginTop: '0.5rem' }} />
      </div>
    </>
  )
}
