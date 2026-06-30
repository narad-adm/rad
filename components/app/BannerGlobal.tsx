interface Props {
  mensagem: string
  tipo: string
}

const ESTILOS: Record<string, { bg: string; borda: string }> = {
  info:  { bg: 'var(--duo-blue)',   borda: '#0284c7' },
  aviso: { bg: 'var(--duo-orange)', borda: '#c2410c' },
  erro:  { bg: '#ef4444',           borda: '#b91c1c' },
}

export default function BannerGlobal({ mensagem, tipo }: Props) {
  const s = ESTILOS[tipo] ?? ESTILOS.info
  return (
    <div style={{
      background: s.bg,
      borderBottom: `3px solid ${s.borda}`,
      color: 'white',
      padding: '0.75rem 1rem',
      textAlign: 'center',
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 800,
      fontSize: '0.875rem',
      lineHeight: 1.4,
    }}>
      {mensagem}
    </div>
  )
}
