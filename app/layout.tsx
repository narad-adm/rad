import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RAD — Recuperação Ativa Diária',
  description: 'Gamificação da recuperação para membros de Narcóticos Anônimos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0e1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  )
}
