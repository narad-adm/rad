export default function DecimoPasooLoading() {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk" style={{ height: 14, width: 120, borderRadius: 6 }} />
          <div className="sk" style={{ height: 24, width: '70%', borderRadius: 8 }} />
        </div>

        {/* Checklist items */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="sk" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
            <div className="sk" style={{ height: 16, flex: 1, width: i % 2 === 1 ? '75%' : '100%', borderRadius: 6 }} />
          </div>
        ))}

        {/* Textarea */}
        <div className="sk" style={{ height: 120, borderRadius: 16, marginTop: '0.5rem' }} />

        {/* Botão */}
        <div className="sk" style={{ height: 52, borderRadius: 13 }} />
      </div>
    </>
  )
}
