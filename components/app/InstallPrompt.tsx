'use client'
import { useEffect, useState } from 'react'
import { X, DownloadSimple, ShareNetwork } from '@phosphor-icons/react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS, setShowIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem('rad-install-dismissed')) return

    // iOS detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as { standalone?: boolean }).standalone === true

    if (isIOS && !isStandalone) {
      // Detecção de capacidade do browser no mount (SSR-safe) — efeito intencional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowIOS(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleDismiss() {
    localStorage.setItem('rad-install-dismissed', '1')
    setDeferredPrompt(null)
    setShowIOS(false)
    setDismissed(true)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('rad-install-dismissed', '1')
    }
    setDeferredPrompt(null)
  }

  if (dismissed) return null
  if (!deferredPrompt && !showIOS) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)', maxWidth: 420,
      background: 'var(--bg-card)',
      border: '2px solid var(--border)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      padding: '1rem',
      zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: 2 }}>
            Instale o RAD no celular
          </p>
          {showIOS ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
              Toque em <ShareNetwork size={13} weight="bold" style={{ display: 'inline', verticalAlign: 'middle' }} /> e depois <strong>&quot;Adicionar à Tela de Início&quot;</strong> para instalar.
            </p>
          ) : (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
              Abra sem barra do navegador e acesse mais rápido.
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'var(--bg-card-2)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-3)',
          }}
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      {!showIOS && (
        <button
          onClick={handleInstall}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <DownloadSimple size={18} weight="bold" />
          Instalar app
        </button>
      )}
    </div>
  )
}
