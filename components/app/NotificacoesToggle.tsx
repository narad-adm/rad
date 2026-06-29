'use client'
import { useState, useEffect } from 'react'
import { Bell, BellSlash } from '@phosphor-icons/react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function NotificacoesToggle() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')

  useEffect(() => {
    // Detecção de suporte a push no mount (SSR-safe) — efeito intencional.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setStatus(sub ? 'subscribed' : 'unsubscribed')
    })
  }, [])

  async function handleToggle() {
    const reg = await navigator.serviceWorker.ready

    if (status === 'subscribed') {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/notificacoes/cancelar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setStatus('unsubscribed')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatus('denied')
      return
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    await fetch('/api/notificacoes/assinar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
    setStatus('subscribed')
  }

  if (status === 'loading' || status === 'unsupported') return null

  const active = status === 'subscribed'

  return (
    <button
      onClick={handleToggle}
      title={active ? 'Desativar notificações' : 'Ativar notificações'}
      style={{
        width: 36, height: 36, borderRadius: 10,
        background: active ? 'var(--duo-blue-bg)' : 'var(--bg-card-2)',
        border: `1.5px solid ${active ? 'var(--duo-blue)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: active ? 'var(--duo-blue)' : 'var(--text-3)',
      }}
    >
      {active
        ? <Bell size={18} weight="duotone" />
        : <BellSlash size={18} weight="duotone" />
      }
    </button>
  )
}
