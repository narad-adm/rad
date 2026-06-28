'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CaretLeft, Bell, Trophy, SignOut, LockKey, EnvelopeSimple,
  HeartStraight, ArrowRight, Drop,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { calcularDiasLimpo, MESES } from '@/lib/types'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

interface Perfil {
  nome: string
  data_limpeza: string
  ranking_opt_in: boolean | null
  criado_em: string
}

interface Props {
  perfil: Perfil
  temNotificacao: boolean
  userId: string
  email: string
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 48, height: 26, borderRadius: 99,
        background: on ? 'var(--duo-blue)' : 'var(--border)',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: on ? 24 : 2,
        width: 22, height: 22, borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s ease',
      }} />
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
      color: 'var(--text-3)', marginBottom: '0.75rem',
    }}>
      {children}
    </p>
  )
}

export default function PerfilClient({ perfil, temNotificacao, userId, email }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [nome, setNome] = useState(perfil.nome)
  const [salvandoNome, setSalvandoNome] = useState(false)
  const [toastNome, setToastNome] = useState(false)

  const [dataLimpeza, setDataLimpeza] = useState(perfil.data_limpeza)
  const [salvandoData, setSalvandoData] = useState(false)
  const [toastData, setToastData] = useState(false)
  const [showRecaida, setShowRecaida] = useState(false)

  const [senhaEnviada, setSenhaEnviada] = useState(false)
  const [enviandoSenha, setEnviandoSenha] = useState(false)

  const [notifStatus, setNotifStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>(
    temNotificacao ? 'subscribed' : 'unsubscribed'
  )
  const [rankingOn, setRankingOn] = useState(perfil.ranking_opt_in === true)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotifStatus('unsupported'); return
    }
    if (Notification.permission === 'denied') {
      setNotifStatus('denied'); return
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setNotifStatus(sub ? 'subscribed' : 'unsubscribed')
    })
  }, [])

  const diasLimpo = calcularDiasLimpo(dataLimpeza)

  const criadoEm = new Date(perfil.criado_em)
  const membroDesde = `${MESES[criadoEm.getMonth()].substring(0, 3)}/${criadoEm.getFullYear()}`

  async function salvarNome() {
    if (!nome.trim() || nome.trim() === perfil.nome) return
    setSalvandoNome(true)
    await supabase.from('perfis').update({ nome: nome.trim() }).eq('id', userId)
    setSalvandoNome(false)
    setToastNome(true)
    setTimeout(() => setToastNome(false), 2000)
  }

  async function salvarData() {
    if (!dataLimpeza) return
    setSalvandoData(true)

    const isRecaida = dataLimpeza > perfil.data_limpeza

    await supabase.from('perfis').update({ data_limpeza: dataLimpeza }).eq('id', userId)

    if (isRecaida) {
      await supabase.from('streaks').update({
        streak_atual: 0,
        ultimo_dia_ativo: null,
        atualizado_em: new Date().toISOString(),
      }).eq('usuario_id', userId)
      setShowRecaida(true)
    } else {
      setToastData(true)
      setTimeout(() => setToastData(false), 2000)
    }

    setSalvandoData(false)
  }

  async function redefinirSenha() {
    setEnviandoSenha(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setEnviandoSenha(false)
    setSenhaEnviada(true)
  }

  async function toggleNotificacao() {
    if (notifStatus === 'unsupported' || notifStatus === 'denied') return

    const reg = await navigator.serviceWorker.ready

    if (notifStatus === 'subscribed') {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/notificacoes/cancelar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setNotifStatus('unsubscribed')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { setNotifStatus('denied'); return }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await fetch('/api/notificacoes/assinar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
    setNotifStatus('subscribed')
  }

  async function toggleRanking() {
    const novo = !rankingOn
    setRankingOn(novo)
    await supabase.from('perfis').update({
      ranking_opt_in: novo,
      ranking_opt_in_em: new Date().toISOString(),
    }).eq('id', userId)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const inicialNome = nome.charAt(0).toUpperCase()

  return (
    <div className="space-y-5">

      {/* Toast */}
      {(toastNome || toastData) && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: 'var(--duo-blue)', color: 'white',
          padding: '0.5rem 1.25rem', borderRadius: 99,
          fontWeight: 800, fontSize: '0.875rem',
          boxShadow: '0 4px 20px rgba(0,157,255,0.4)',
          animation: 'popIn 0.2s ease',
        }}>
          {toastNome ? 'Nome atualizado!' : 'Data atualizada!'}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--bg-card-2)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-2)', flexShrink: 0,
          }}
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>Meu Perfil</h1>
      </div>

      {/* Avatar / Identificação */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        padding: '1.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--accent-grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 900, color: 'white',
        }}>
          {inicialNome}
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1)' }}>{perfil.nome}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: 2 }}>
            {diasLimpo} dia{diasLimpo !== 1 ? 's' : ''} limpo{diasLimpo !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'var(--duo-blue-bg)', color: 'var(--duo-blue)',
          border: '1.5px solid var(--duo-blue)',
          borderRadius: 99, padding: '3px 10px',
          fontSize: '0.72rem', fontWeight: 800,
        }}>
          <Drop size={12} weight="duotone" />
          Membro desde {membroDesde}
        </div>
      </div>

      {/* Informações da conta */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        padding: '1.25rem',
      }}>
        <SectionTitle>INFORMAÇÕES DA CONTA</SectionTitle>

        {/* Nome */}
        <div style={{ marginBottom: '1rem' }}>
          <label className="label" style={{ display: 'block', marginBottom: '0.375rem' }}>Nome</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input-field"
              value={nome}
              onChange={e => setNome(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              onClick={salvarNome}
              disabled={salvandoNome || !nome.trim() || nome.trim() === perfil.nome}
              style={{ whiteSpace: 'nowrap', padding: '0 1rem' }}
            >
              {salvandoNome ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0.875rem 0' }} />

        {/* Senha */}
        <div>
          <label className="label" style={{ display: 'block', marginBottom: '0.375rem' }}>Senha</label>
          {senhaEnviada ? (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              background: 'var(--duo-blue-bg)',
              border: '1.5px solid var(--duo-blue)',
              borderRadius: 12, padding: '0.75rem',
            }}>
              <EnvelopeSimple size={18} weight="bold" color="var(--duo-blue)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--duo-blue)', fontWeight: 600 }}>
                Enviamos um link para <strong>{email}</strong>. Verifique sua caixa de entrada.
              </p>
            </div>
          ) : (
            <button
              className="btn-outline"
              onClick={redefinirSenha}
              disabled={enviandoSenha}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LockKey size={16} weight="bold" />
              {enviandoSenha ? 'Enviando...' : 'Redefinir senha por e-mail'}
            </button>
          )}
        </div>
      </div>

      {/* Data de limpeza */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        padding: '1.25rem',
      }}>
        <SectionTitle>DATA DE LIMPEZA</SectionTitle>

        {!showRecaida ? (
          <>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.75rem' }}>
              Limpo(a) desde {new Date(dataLimpeza + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="input-field"
                value={dataLimpeza}
                onChange={e => setDataLimpeza(e.target.value)}
                style={{ flex: 1, minWidth: 160 }}
              />
              <button
                className="btn-primary"
                onClick={salvarData}
                disabled={salvandoData || !dataLimpeza || dataLimpeza === perfil.data_limpeza}
                style={{ whiteSpace: 'nowrap', padding: '0 1rem' }}
              >
                {salvandoData ? 'Salvando...' : 'Atualizar data'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,157,255,0.08), rgba(125,136,230,0.08))',
            border: '2px solid rgba(0,157,255,0.3)',
            borderRadius: 20, padding: '1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          }}>
            <HeartStraight size={36} weight="duotone" color="var(--duo-blue)" />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-1)', marginBottom: '0.75rem' }}>
                Seja bem-vindo(a) de volta
              </p>
              <p style={{
                fontSize: '0.9rem', lineHeight: 1.7,
                color: 'var(--text-1)', fontStyle: 'italic',
              }}>
                Uma recaída não significa que tudo está perdido ou que você fracassou, mas pode ser exatamente o momento que vai despertar a sua força, ajudando a vencer o desânimo para se dedicar ainda mais ao programa, trazendo você de volta ao caminho com a certeza de que é possível recuperar.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => router.push('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowRight size={18} weight="bold" />
              Ir para o início
            </button>
          </div>
        )}
      </div>

      {/* Configurações */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
          <SectionTitle>CONFIGURAÇÕES</SectionTitle>
        </div>

        {/* Notificações */}
        {notifStatus !== 'unsupported' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1.25rem',
            borderTop: '1.5px solid var(--border)',
          }}>
            <Bell size={20} weight="duotone" color="var(--text-2)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)' }}>
                Notificações diárias
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>
                {notifStatus === 'denied' ? 'Bloqueadas no navegador' : 'Lembrete diário às 18h'}
              </p>
            </div>
            {notifStatus === 'denied' ? (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700 }}>Bloqueado</span>
            ) : (
              <Switch on={notifStatus === 'subscribed'} onToggle={toggleNotificacao} />
            )}
          </div>
        )}

        {/* Ranking — só se já passou pelo opt-in */}
        {perfil.ranking_opt_in !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1.25rem',
            borderTop: '1.5px solid var(--border)',
          }}>
            <Trophy size={20} weight="duotone" color="var(--text-2)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)' }}>
                Ranking da comunidade
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>
                Aparecer no ranking semanal
              </p>
            </div>
            <Switch on={rankingOn} onToggle={toggleRanking} />
          </div>
        )}
      </div>

      {/* Conta / Logout */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        padding: '1.25rem',
      }}>
        <SectionTitle>CONTA</SectionTitle>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.75rem',
            background: 'transparent',
            border: '1.5px solid rgba(239,68,68,0.3)',
            borderRadius: 12, cursor: 'pointer',
            color: '#ef4444', fontWeight: 700, fontSize: '0.9rem',
            fontFamily: 'Nunito',
          }}
        >
          <SignOut size={18} weight="bold" />
          Sair da conta
        </button>
      </div>

    </div>
  )
}
