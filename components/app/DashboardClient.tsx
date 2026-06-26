'use client'
import Link from 'next/link'
import {
  Fire, Trophy, CheckCircle,
  CalendarCheck, BookOpenText, ClipboardText, ChatCircleText, SignOut, CaretRight,
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

const DIAS_SEMANA_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

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

  // Week tracker: Mon=0 … Sun=6
  const jsDay = agora.getDay()
  const todayMon = jsDay === 0 ? 6 : jsDay - 1

  function getDayType(i: number): 'done' | 'today-done' | 'today-empty' | 'past-empty' | 'future' {
    if (i > todayMon) return 'future'
    if (i === todayMon) return pontuacaoHoje > 0 ? 'today-done' : 'today-empty'
    const daysBack = todayMon - i
    return daysBack < streak ? 'done' : 'past-empty'
  }

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

  const doneCount = [reunioesHoje > 0, leuHoje, inventarioHoje].filter(Boolean).length

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700 }}>
            {diaSemana}, {dia} de {mes}
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
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

      {/* ── Hero — Tempo Limpo ─────────────────────────── */}
      <div style={{ background: 'var(--accent-grad)', borderRadius: 20, padding: '1.5rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.875rem' }}>
          TEMPO LIMPO
        </p>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          {anos > 0 && <MiniCard valor={anos} label="anos" grande={false} />}
          {(anos > 0 || meses > 0) && <MiniCard valor={meses} label="meses" grande={false} />}
          <MiniCard valor={dias} label="dias" grande={anos === 0 && meses === 0} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.875rem' }}>
          Só por hoje 💙
        </p>
      </div>

      {/* ── Section: Esta semana ───────────────────────── */}
      <SectionPill
        color="#FF9600"
        shadow="#CC7800"
        label="ESTA SEMANA"
        right={streak > 0 ? `🔥 ${streak} dias` : undefined}
      />

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {DIAS_SEMANA_SHORT.map((label, i) => {
            const type = getDayType(i)
            const isActive = type === 'done' || type === 'today-done'
            const isToday = type === 'today-done' || type === 'today-empty'
            return (
              <div key={i} className="day-col">
                <span className="day-label" style={{
                  color: isToday ? 'var(--duo-blue)' : isActive ? 'var(--duo-orange)' : 'var(--duo-gray)',
                }}>
                  {label}
                </span>
                <DayCircle type={type} />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section: XP de hoje ───────────────────────── */}
      <SectionPill
        color="var(--duo-blue)"
        shadow="var(--duo-blue-dark)"
        label="XP DE HOJE"
        right={`${nivel.emoji} ${nivel.nivel}`}
      />

      <div className="card" style={{ paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--duo-yellow-dark)', lineHeight: 1 }}>
            {pontuacaoHoje}
          </span>
          <span style={{ color: 'var(--duo-gray)', fontSize: '0.875rem', fontWeight: 700 }}>/100 XP</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{nivel.mensagem}</span>
        </div>
        {/* Duolingo XP bar */}
        <div className="duo-bar-wrap" style={{ marginRight: 60 }}>
          <div className="duo-bar-track" />
          <div className="duo-bar-fill" style={{ width: `${Math.max(5, Math.min(100, porcentagem))}%` }}>
            <div className="duo-bar-shine" />
          </div>
        </div>
        <div className="duo-bar-badge" style={{ position: 'relative', display: 'inline-block', marginTop: '0.5rem', float: 'right' }}>
          {pontuacaoHoje}/100
        </div>
        <div style={{ clear: 'both' }} />
      </div>

      {/* ── Section: Atividades de hoje ───────────────── */}
      <SectionPill
        color="var(--duo-green)"
        shadow="var(--duo-green-dark)"
        label="ATIVIDADES DE HOJE"
        right={`${doneCount}/3`}
      />

      <div className="space-y-3">
        <Link href="/reuniao" className={`task-card ${reunioesHoje > 0 ? 'task-card--done' : ''}`}>
          <div className="task-icon-circle" style={{
            background: reunioesHoje > 0 ? 'rgba(28,176,246,0.15)' : 'rgba(255,150,0,0.12)',
            color: reunioesHoje > 0 ? 'var(--duo-blue)' : 'var(--duo-orange)',
          }}>
            <CalendarCheck size={26} weight="duotone" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: reunioesHoje > 0 ? 'var(--duo-blue)' : 'var(--text-1)', letterSpacing: '-0.01em' }}>
              Fui à reunião
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
              {reunioesHoje > 0 ? `${reunioesHoje} reunião(ões) hoje ✓` : 'Registre sua presença'}
            </div>
          </div>
          {reunioesHoje > 0
            ? <CheckCircle size={22} weight="bold" color="var(--duo-blue)" />
            : <><span className="badge badge-orange">+30 XP</span><CaretRight size={16} weight="bold" color="var(--duo-gray)" /></>
          }
        </Link>

        <Link href="/sohoje" className={`task-card ${leuHoje ? 'task-card--done' : ''}`}>
          <div className="task-icon-circle" style={{
            background: leuHoje ? 'rgba(28,176,246,0.15)' : 'rgba(206,130,255,0.12)',
            color: leuHoje ? 'var(--duo-blue)' : 'var(--duo-purple)',
          }}>
            <BookOpenText size={26} weight="duotone" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: leuHoje ? 'var(--duo-blue)' : 'var(--text-1)', letterSpacing: '-0.01em' }}>
              Só por hoje
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
              {leuHoje ? 'Leitura concluída hoje ✓' : 'Leia o texto do dia'}
            </div>
          </div>
          {leuHoje
            ? <CheckCircle size={22} weight="bold" color="var(--duo-blue)" />
            : <><span className="badge badge-purple">+20 XP</span><CaretRight size={16} weight="bold" color="var(--duo-gray)" /></>
          }
        </Link>

        <Link href="/decimo-passo" className={`task-card ${inventarioHoje ? 'task-card--done' : ''}`}>
          <div className="task-icon-circle" style={{
            background: inventarioHoje ? 'rgba(28,176,246,0.15)' : 'rgba(88,204,2,0.12)',
            color: inventarioHoje ? 'var(--duo-blue)' : 'var(--duo-green)',
          }}>
            <ClipboardText size={26} weight="duotone" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: inventarioHoje ? 'var(--duo-blue)' : 'var(--text-1)', letterSpacing: '-0.01em' }}>
              10° Passo
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
              {inventarioHoje ? 'Inventário feito hoje ✓' : 'Inventário pessoal diário'}
            </div>
          </div>
          {inventarioHoje
            ? <CheckCircle size={22} weight="bold" color="var(--duo-blue)" />
            : <><span className="badge badge-green">+25 XP</span><CaretRight size={16} weight="bold" color="var(--duo-gray)" /></>
          }
        </Link>
      </div>

      {/* ── Streak + Recorde ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Streak */}
        <div style={{
          background: streak > 0 ? 'var(--streak-card-bg)' : 'var(--bg-card)',
          border: `2.5px solid ${streak > 0 ? 'rgba(255,150,0,0.4)' : 'var(--border)'}`,
          borderRadius: 16, padding: '1rem', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: streak > 0 ? 'rgba(255,150,0,0.15)' : 'var(--bg-card-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.5rem',
            color: streak > 0 ? 'var(--duo-orange)' : 'var(--duo-gray)',
          }}>
            <Fire size={26} weight="duotone" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: streak > 0 ? 'var(--duo-orange)' : 'var(--duo-gray)', lineHeight: 1 }}>
            {streak}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--duo-gray)', marginTop: '0.25rem', fontWeight: 700 }}>
            {streak > 0 ? 'dias seguidos' : 'Comece hoje!'}
          </div>
        </div>

        {/* Recorde */}
        <div style={{
          background: 'var(--trophy-card-bg)',
          border: '2.5px solid rgba(234,179,8,0.35)',
          borderRadius: 16, padding: '1rem', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(217,119,6,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.5rem',
            color: '#d97706',
          }}>
            <Trophy size={26} weight="duotone" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{streakMax}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--duo-gray)', marginTop: '0.25rem', fontWeight: 700 }}>
            recorde pessoal
          </div>
          {streak === streakMax && streak > 0 && (
            <div style={{ marginTop: '0.375rem' }}>
              <span className="badge badge-yellow">🏅 Recorde atual!</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Section: Mais ─────────────────────────────── */}
      <SectionPill
        color="var(--duo-purple)"
        shadow="var(--duo-purple-dark)"
        label="GUIA DOS PASSOS"
      />

      <Link href="/passos" className="task-card task-card--special">
        <div className="task-icon-circle" style={{ background: 'rgba(216,79,158,0.15)', color: 'var(--duo-pink)' }}>
          <ChatCircleText size={26} weight="duotone" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--duo-pink)', letterSpacing: '-0.01em' }}>
            Guia dos 12 Passos
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
            Responda perguntas e ganhe XP
          </div>
        </div>
        <span className="badge badge-pink">+15 XP</span>
        <CaretRight size={16} weight="bold" color="var(--duo-pink)" />
      </Link>

    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function MiniCard({ valor, label, grande }: { valor: number; label: string; grande: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: '0.625rem 0.75rem', flex: 1, textAlign: 'center' }}>
      <div style={{ color: 'white', fontSize: grande ? '2.25rem' : '1.75rem', fontWeight: 900, lineHeight: 1 }}>{valor}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontWeight: 700, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

function SectionPill({ color, shadow, label, right }: {
  color: string; shadow: string; label: string; right?: string
}) {
  return (
    <div style={{
      background: color,
      borderRadius: 14,
      padding: '10px 18px',
      borderBottom: `4px solid ${shadow}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {right && (
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 800 }}>
          {right}
        </span>
      )}
    </div>
  )
}

function DayCircle({ type }: { type: 'done' | 'today-done' | 'today-empty' | 'past-empty' | 'future' }) {
  const cls = {
    'done':        'day-circle day-circle--done',
    'today-done':  'day-circle day-circle--today',
    'today-empty': 'day-circle day-circle--today',
    'past-empty':  'day-circle day-circle--empty',
    'future':      'day-circle day-circle--future',
  }[type]

  const showCheck = type === 'done' || type === 'today-done'

  return (
    <div className={cls}>
      {showCheck && (
        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
          <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === 'today-empty' && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
      )}
    </div>
  )
}
