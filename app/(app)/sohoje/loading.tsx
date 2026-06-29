export default function SoHojeLoading() {
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header — badge + data + título */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk" style={{ height: 14, width: 100, borderRadius: 6 }} />
          <div className="sk" style={{ height: 16, width: 160 }} />
          <div className="sk" style={{ height: 28, width: '80%', borderRadius: 8 }} />
        </div>

        {/* Citação */}
        <div className="sk" style={{ height: 110, borderRadius: 20 }} />

        {/* Separador */}
        <div className="sk" style={{ height: 1, borderRadius: 1 }} />

        {/* Reflexão — linhas de texto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="sk" style={{ height: 12, width: 80, borderRadius: 6 }} />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="sk" style={{ height: 16, width: i % 3 === 2 ? '65%' : '100%', borderRadius: 6 }} />
          ))}
        </div>

        {/* Separador */}
        <div className="sk" style={{ height: 1, borderRadius: 1 }} />

        {/* Afirmação */}
        <div className="sk" style={{ height: 90, borderRadius: 20 }} />

        {/* Botão */}
        <div className="sk" style={{ height: 52, borderRadius: 13 }} />
      </div>
    </>
  )
}
