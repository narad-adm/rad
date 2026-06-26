'use client'
import Link from 'next/link'
import {
  Fire, Trophy, CheckCircle,
  CalendarCheck, BookOpenText, ClipboardText, ChatCircleText, SignOut,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { MESES, DIAS_SEMANA } from '@/lib/types'
import ThemeToggle from '@/components/app/ThemeToggle'

interface Props {
  nome: string
  diasLimpo: number
  dataLimpeza: string
  pontuacaoHoje: number
  porcentagem: number
  nivel: { nivel: string; cor: string; mensagem: string; emoji: string }
  streak: number
  streakMax: number
  reunioesHoje: number
  leuHoje: boolean
  inventarioHoje: boolean
}

export default function DashboardClient({
  nome, diasLimpo, pontuacaoHoje, porcentagem,
  nivel, streak, streakMax, reunioesHoje, leuHoje, inventarioHoje,
}: Props) {
  const agora = new Date()
  const diaSemana = DIAS_SEMANA[agora.getDay()]
  const dia = agora.getDate()
  const mes = MESES[agora.getMonth()]

  const anos  = Math.floor(diasLimpo / 365)
  const meses = Math.floor((diasLimpo % 365) / 30)
  const dias  = diasLimpo % 30

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const saudacao = () => {
    const h = agora.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-2)', fontSize: '0.75rem', fontWeight: 700 }}>
            {diaSemana}, {dia} de {mes}
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.25rem', fontWeight: 800 }}>
            {saudacao()}, {nome.split(' ')[0]}! 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="theme-toggle" aria-label="Sair">
            <SignOut size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Hero — Tempo Limpo */}
      <div style={{ background: 'var(--accent-grad)', borderRadius: 24, padding: '1.75rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1rem' }}>
          TEMPO LIMPO
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {anos > 0 && <MiniCard valor={anos} label="anos" grande={false} />}
          {(anos > 0 || meses > 0) && <MiniCard valor={meses} label="meses" grande={false} />}
          <MiniCard valor={dias} label="dias" grande={anos === 0 && meses === 0} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 700, marginTop: '1rem' }}>
          Só por hoje 💙
        </p>
      </div>

      {/* Pontuação do dia */}
      <div className="card" style={pontuacaoHoje >= 70 ? { borderColor: 'rgba(0,157,255,0.4)' } : {}}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em' }}>HOJE</p>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--text-1)', fontSize: '1.75rem', fontWeight: 900 }}>{pontuacaoHoje}</span>
              <span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>/100 pts</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.125rem' }}>{nivel.emoji}</div>
            <div style={{ color: nivel.cor, fontSize: '0.75rem', fontWeight: 800 }}>{nivel.nivel}</div>
          </div>
        </div>
        <div className="progress-bar mb-3">
          <div className="progress-fill" style={{ width: `${porcentagem}%` }} />
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{nivel.mensagem}</p>
      </div>

      {/* Streak e Recorde */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Streak */}
        <div style={{
          background: streak > 0 ? 'var(--streak-card-bg)' : 'var(--bg-card)',
          border: '2px solid rgba(255,107,53,0.3)',
          borderRadius: 20, padding: '1.25rem', textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,107,53,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: streak > 0 ? '#ff6b35' : 'var(--text-3)',
          }}>
            <Fire size={28} weight="duotone" />
          </div>
          {streak > 0 ? (
            <>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ff6b35', lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>dias seguidos</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-3)', lineHeight: 1 }}>0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Comece hoje!</div>
            </>
          )}
        </div>

        {/* Recorde */}
        <div style={{
          background: 'var(--trophy-card-bg)',
          border: '2px solid rgba(234,179,8,0.3)',
          borderRadius: 20, padding: '1.25rem', textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(217,119,6,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            color: '#d97706',
          }}>
            <Trophy size={28} weight="duotone" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{streakMax}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>recorde pessoal</div>
          {streak === streakMax && streak > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-green">🏅 Recorde atual!</span>
            </div>
          )}
        </div>
      </div>

      {/* Hoje você já fez */}
      <div className="card">
        <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          HOJE VOCÊ JÁ FEZ
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <ActivityMiniCard done={reunioesHoje > 0} label="Reunião">
            <CalendarCheck size={24} weight="bold" />
          </ActivityMiniCard>
          <ActivityMiniCard done={leuHoje} label="Leitura">
            <BookOpenText size={24} weight="duotone" />
          </ActivityMiniCard>
          <ActivityMiniCard done={inventarioHoje} label="Inventário">
            <ClipboardText size={24} weight="duotone" />
          </ActivityMiniCard>
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          O QUE VOCÊ QUER FAZER AGORA?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <ActivityCard
            href="/reuniao"
            iconGrad="linear-gradient(135deg, #009dff, #7d88e6)"
            titulo="Fui à reunião"
            pts="+30 pts"
            done={reunioesHoje > 0}
          >
            <CalendarCheck size={28} weight="duotone" color="white" />
          </ActivityCard>
          <ActivityCard
            href="/sohoje"
            iconGrad="linear-gradient(135deg, #7d88e6, #ab91ec)"
            titulo="Só por hoje"
            pts="+20 pts"
            done={leuHoje}
          >
            <BookOpenText size={28} weight="duotone" color="white" />
          </ActivityCard>
          <ActivityCard
            href="/decimo-passo"
            iconGrad="linear-gradient(135deg, #8a81e5, #b280e6)"
            titulo="10° Passo"
            pts="+25 pts"
            done={inventarioHoje}
          >
            <ClipboardText size={28} weight="duotone" color="white" />
          </ActivityCard>
          <ActivityCard
            href="/passos"
            iconGrad="linear-gradient(135deg, #22c55e, #16a34a)"
            titulo="Guia dos passos"
            pts="+15 pts/resp."
            done={false}
          >
            <ChatCircleText size={28} weight="duotone" color="white" />
          </ActivityCard>
        </div>
      </div>

    </div>
  )
}

function MiniCard({ valor, label, grande }: { valor: number; label: string; grande: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '0.75rem', flex: 1, textAlign: 'center' }}>
      <div style={{ color: 'white', fontSize: grande ? '2.5rem' : '2rem', fontWeight: 900, lineHeight: 1 }}>{valor}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 700, marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}

function ActivityMiniCard({ done, label, children }: { done: boolean; label: string; children: React.ReactNode }) {
  return (
    <div
      className={!done ? 'animate-pulse' : ''}
      style={{
        background: done ? 'rgba(34,197,94,0.1)' : 'var(--bg-card-2)',
        border: done ? '2px solid rgba(34,197,94,0.3)' : '2px dashed var(--border)',
        borderRadius: 16,
        padding: '0.75rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.375rem',
        textAlign: 'center',
      }}>
      {done
        ? <CheckCircle size={24} weight="bold" color="#22c55e" />
        : <div style={{ color: 'var(--text-3)' }}>{children}</div>
      }
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: done ? 'var(--text-2)' : 'var(--text-3)' }}>
        {label}
      </span>
    </div>
  )
}

function ActivityCard({ href, iconGrad, titulo, pts, done, children }: {
  href: string; iconGrad: string; titulo: string; pts: string; done: boolean; children: React.ReactNode
}) {
  return (
    <Link href={href} className="activity-card">
      {done && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CheckCircle size={18} weight="bold" color="#22c55e" />
        </div>
      )}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: iconGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)' }}>{titulo}</div>
        <div style={{ marginTop: '0.25rem' }}>
          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{pts}</span>
        </div>
      </div>
    </Link>
  )
}
