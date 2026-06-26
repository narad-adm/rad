import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RAD — Recuperação Ativa Diária',
  description: 'Gamificação da recuperação para membros de Narcóticos Anônimos',
}

const themeScript = `
  (function() {
    const saved = localStorage.getItem('rad-theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
  })();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#009dff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
