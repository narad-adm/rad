'use client'

import { useEffect } from 'react'

const CHAVE = 'rad-ultimo-ping'
const INTERVALO_MS = 30 * 60 * 1000 // registra no máximo 1x a cada 30 min

/**
 * Registra o acesso do usuário ao abrir o app, com throttle via
 * localStorage para não inflar o log. Totalmente fire-and-forget:
 * qualquer erro é ignorado e nunca afeta a navegação.
 */
export default function RegistrarAcesso() {
  useEffect(() => {
    try {
      const agora = Date.now()
      const ultimo = Number(localStorage.getItem(CHAVE) ?? 0)
      if (agora - ultimo < INTERVALO_MS) return

      localStorage.setItem(CHAVE, String(agora))
      fetch('/api/acesso', { method: 'POST', keepalive: true }).catch(() => {})
    } catch {
      // localStorage indisponível, etc. — ignora.
    }
  }, [])

  return null
}
