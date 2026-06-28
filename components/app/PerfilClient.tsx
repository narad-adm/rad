'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CaretLeft, Bell, Trophy, SignOut, LockKey, Eye, EyeSlash,
  HeartStraight, ArrowRight, Drop, ShareNetwork,
  ShieldCheck, ShieldSlash, CheckCircle, XCircle, X,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { calcularDiasLimpo, MESES } from '@/lib/types'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

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

function Switch({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        width: 48, height: 26, borderRadius: 99,
        background: on ? 'var(--duo-blue)' : 'var(--border)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
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
    <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: '0.875rem' }}>
      {children}
    </p>
  )
}

// ── Modal de redefinir senha ──────────────────────────────────
function ModalSenha({ onFechar }: { onFechar: () => void }) {
  const supabase = createClient()
  const [nova, setNova] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showNova, setShowNova] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)

  async function salvar() {
    setErro('')
    if (nova.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (nova !== confirmar) { setErro('As senhas não coincidem.'); return }
    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: nova })
    setSalvando(false)
    if (error) { setErro('Erro ao atualizar a senha. Tente novamente.'); return }
    setOk(true)
    setTimeout(onFechar, 1500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 24, padding: '1.5rem',
        width: '100%', maxWidth: 380,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-1)' }}>Redefinir senha</p>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        {ok ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.75rem', padding: '1.5rem 0',
          }}>
            <CheckCircle size={48} weight="duotone" color="var(--duo-blue)" />
            <p style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-1)' }}>Senha atualizada!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '0.375rem' }}>Nova senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showNova ? 'text' : 'password'}
                  value={nova}
                  onChange={e => setNova(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  style={{ width: '100%', paddingRight: '2.5rem', boxSizing: 'border-box' }}
                />
                <button onClick={() => setShowNova(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                  {showNova ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '0.375rem' }}>Confirmar nova senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                  style={{ width: '100%', paddingRight: '2.5rem', boxSizing: 'border-box' }}
                />
                <button onClick={() => setShowConfirmar(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                  {showConfirmar ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>
            {erro && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{erro}</p>
            )}
            <button className="btn-primary" onClick={salvar} disabled={salvando} style={{ marginTop: '0.25rem' }}>
              {salvando ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Modal de instruções do ranking ───────────────────────────
function ModalRankingInfo({ onConfirmar, onFechar }: { onConfirmar: () => void; onFechar: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: '24px 24px 0 0',
        padding: '1.5rem 1.25rem 2rem',
        width: '100%', maxWidth: 480,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <p style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-1)' }}>Ranking da comunidade</p>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <div style={{
          background: 'var(--bg-card-2)',
          border: '1.5px solid var(--border)',
          borderRadius: 16, padding: '1rem', marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <ShieldCheck size={15} weight="bold" color="var(--duo-green)" />
            <span style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '0.85rem' }}>Compartilhado</span>
          </div>
          {['Seu nome de cadastro', 'Seus pontos desta semana', 'Sua sequência de dias (streak)'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <CheckCircle size={14} weight="bold" color="var(--duo-green)" />
              <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{item}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '0.625rem 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <ShieldSlash size={15} weight="bold" color="#ef4444" />
            <span style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '0.85rem' }}>Nunca visível</span>
          </div>
          {['Suas respostas e reflexões', 'Seus inventários do 10° Passo', 'Seu tempo de limpeza e dados pessoais'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <XCircle size={14} weight="bold" color="#ef4444" />
              <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{item}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontStyle: 'italic', textAlign: 'center', marginBottom: '1rem' }}>
          Você pode sair do ranking a qualquer momento nas configurações do perfil.
        </p>

        <button className="btn-primary" onClick={onConfirmar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Trophy size={16} weight="bold" />
          Participar do ranking
        </button>
        <button className="btn-ghost" onClick={onFechar} style={{ width: '100%', marginTop: '0.5rem' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
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

  const [modalSenha, setModalSenha] = useState(false)

  const [notifOn, setNotifOn] = useState(temNotificacao)
  const [notifBloqueada, setNotifBloqueada] = useState(false)
  const [notifSuportada, setNotifSuportada] = useState(true)
  const [notifLoading, setNotifLoading] = useState(false)

  const [rankingOn, setRankingOn] = useState(perfil.ranking_opt_in === true)
  const [modalRanking, setModalRanking] = useState(false)

  const [toastConvite, setToastConvite] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotifSuportada(false); return
    }
    if (Notification.permission === 'denied') {
      setNotifBloqueada(true); return
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setNotifOn(!!sub)
      // Subscription lost by browser (iOS clears it) — clean up stale DB record
      if (!sub && temNotificacao) {
        fetch('/api/notificacoes/cancelar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }).catch(() => {})
      }
    }).catch(() => setNotifSuportada(false))
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
    setTimeout(() => { setToastNome(false); router.refresh() }, 1500)
  }

  async function salvarData() {
    if (!dataLimpeza) return
    setSalvandoData(true)
    const isRecaida = dataLimpeza > perfil.data_limpeza
    await supabase.from('perfis').update({ data_limpeza: dataLimpeza }).eq('id', userId)
    if (isRecaida) {
      await supabase.from('streaks').update({
        streak_atual: 0, ultimo_dia_ativo: null,
        atualizado_em: new Date().toISOString(),
      }).eq('usuario_id', userId)
      setShowRecaida(true)
    } else {
      setToastData(true)
      setTimeout(() => setToastData(false), 2000)
    }
    setSalvandoData(false)
  }

  async function toggleNotificacao() {
    if (notifBloqueada || !notifSuportada || notifLoading) return
    if (!('serviceWorker' in navigator)) { setNotifSuportada(false); return }
    setNotifLoading(true)
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]) as ServiceWorkerRegistration

      if (notifOn) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await fetch('/api/notificacoes/cancelar', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
        }
        setNotifOn(false)
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') { setNotifBloqueada(true); setNotifLoading(false); return }
        if (!VAPID_PUBLIC_KEY) { console.error('VAPID key ausente'); setNotifLoading(false); return }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        await fetch('/api/notificacoes/assinar', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        })
        setNotifOn(true)
      }
    } catch (e) {
      console.error('Notificação erro:', e)
    } finally {
      setNotifLoading(false)
    }
  }

  async function confirmarRanking() {
    setModalRanking(false)
    setRankingOn(true)
    await supabase.from('perfis').update({
      ranking_opt_in: true,
      ranking_opt_in_em: new Date().toISOString(),
    }).eq('id', userId)
  }

  async function desativarRanking() {
    setRankingOn(false)
    await supabase.from('perfis').update({
      ranking_opt_in: false,
      ranking_opt_in_em: new Date().toISOString(),
    }).eq('id', userId)
  }

  function handleToggleRanking() {
    if (rankingOn) {
      desativarRanking()
    } else {
      setModalRanking(true)
    }
  }

  async function compartilhar() {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://rad.vercel.app'
    const texto = `Estou usando o RAD — Recuperação Ativa Diária, um app para apoiar minha jornada em NA. Se quiser experimentar: ${url}`
    if (navigator.share) {
      try { await navigator.share({ text: texto }) } catch {}
    } else {
      await navigator.clipboard.writeText(texto)
      setToastConvite(true)
      setTimeout(() => setToastConvite(false), 2000)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Modais */}
      {modalSenha && <ModalSenha onFechar={() => setModalSenha(false)} />}
      {modalRanking && (
        <ModalRankingInfo
          onConfirmar={confirmarRanking}
          onFechar={() => setModalRanking(false)}
        />
      )}

      {/* Toasts */}
      {(toastNome || toastData || toastConvite) && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: 'var(--duo-blue)', color: 'white',
          padding: '0.5rem 1.25rem', borderRadius: 99,
          fontWeight: 800, fontSize: '0.875rem',
          boxShadow: '0 4px 20px rgba(0,157,255,0.4)',
          animation: 'popIn 0.2s ease', whiteSpace: 'nowrap',
        }}>
          {toastNome ? 'Nome atualizado!' : toastData ? 'Data atualizada!' : 'Link copiado!'}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => router.push('/dashboard')} className="theme-toggle" aria-label="Voltar">
            <CaretLeft size={18} weight="bold" />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>Meu Perfil</h1>
        </div>

        {/* Avatar */}
        <div style={{
          background: 'var(--bg-card)', border: '2.5px solid var(--border)',
          borderRadius: 20, boxShadow: '0 4px 0 var(--border)',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--accent-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 900, color: 'white',
          }}>
            {nome.charAt(0).toUpperCase()}
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
          background: 'var(--bg-card)', border: '2.5px solid var(--border)',
          borderRadius: 20, boxShadow: '0 4px 0 var(--border)', padding: '1.25rem',
        }}>
          <SectionTitle>INFORMAÇÕES DA CONTA</SectionTitle>

          <label className="label" style={{ display: 'block', marginBottom: '0.375rem' }}>Nome</label>
          <input
            className="input-field"
            value={nome}
            onChange={e => setNome(e.target.value)}
            style={{ display: 'block', width: '100%', boxSizing: 'border-box' }}
          />
          <button
            className="btn-primary"
            onClick={salvarNome}
            disabled={salvandoNome || !nome.trim() || nome.trim() === perfil.nome}
            style={{ marginTop: '0.5rem' }}
          >
            {salvandoNome ? 'Salvando...' : 'Salvar nome'}
          </button>

          <button
            className="btn-outline"
            onClick={() => setModalSenha(true)}
            style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LockKey size={16} weight="bold" />
            Redefinir senha
          </button>
        </div>

        {/* Data de início de recuperação */}
        <div style={{
          background: 'var(--bg-card)', border: '2.5px solid var(--border)',
          borderRadius: 20, boxShadow: '0 4px 0 var(--border)', padding: '1.25rem',
        }}>
          <SectionTitle>DATA DE INÍCIO DE RECUPERAÇÃO</SectionTitle>

          {!showRecaida ? (
            <>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.75rem' }}>
                Limpo(a) desde {new Date(dataLimpeza + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div style={{ overflow: 'hidden' }}>
                <input
                  type="date"
                  className="input-field"
                  value={dataLimpeza}
                  onChange={e => setDataLimpeza(e.target.value)}
                  style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem' }}
                />
              </div>
              <button
                className="btn-primary"
                onClick={salvarData}
                disabled={salvandoData || !dataLimpeza || dataLimpeza === perfil.data_limpeza}
              >
                {salvandoData ? 'Salvando...' : 'Atualizar data'}
              </button>
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
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-1)', fontStyle: 'italic' }}>
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
          background: 'var(--bg-card)', border: '2.5px solid var(--border)',
          borderRadius: 20, boxShadow: '0 4px 0 var(--border)', overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
            <SectionTitle>CONFIGURAÇÕES</SectionTitle>
          </div>

          {/* Notificações */}
          {notifSuportada && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1.25rem',
              borderTop: '1.5px solid var(--border)',
            }}>
              <Bell size={20} weight="duotone" color="var(--text-2)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)' }}>
                  Notificações
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>
                  {notifBloqueada ? 'Bloqueadas no navegador' : 'Permitir notificações do app'}
                </p>
              </div>
              <Switch on={notifOn} onToggle={toggleNotificacao} disabled={notifBloqueada || notifLoading} />
            </div>
          )}

          {/* Ranking */}
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
              <Switch on={rankingOn} onToggle={handleToggleRanking} />
            </div>
          )}
        </div>

        {/* Convidar amigo */}
        <div style={{
          background: 'var(--bg-card)', border: '2.5px solid var(--border)',
          borderRadius: 20, boxShadow: '0 4px 0 var(--border)', padding: '1.25rem',
        }}>
          <SectionTitle>COMUNIDADE</SectionTitle>
          <button
            className="btn-primary"
            onClick={compartilhar}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShareNetwork size={18} weight="bold" />
            Convidar um amigo para o RAD
          </button>
        </div>

        {/* Conta / Logout */}
        <div style={{
          background: 'var(--bg-card)', border: '2.5px solid var(--border)',
          borderRadius: 20, boxShadow: '0 4px 0 var(--border)', padding: '1.25rem',
        }}>
          <SectionTitle>CONTA</SectionTitle>
          <button
            className="btn-primary"
            onClick={handleLogout}
            style={{ background: '#ef4444', borderBottomColor: '#b91c1c' }}
          >
            <SignOut size={18} weight="bold" style={{ marginRight: 8 }} />
            Sair da conta
          </button>
        </div>

      </div>
    </>
  )
}
