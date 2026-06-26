'use client'
import Link from 'next/link'
import {
  Fire, Trophy, CheckCircle, HandWaving, Heart, Medal,
  CalendarCheck, BookOpenText, ClipboardText, ChatCircleText,
  SignOut, CaretRight, Leaf, LightningA,
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
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700 }}>
            {diaSemana}, {dia} de {mes}
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saudacao()}, {nome.split(' ')[0]}!
            <HandWaving size={20} weight="duotone" color="var(--duo-yellow)" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="theme-toggle" aria-label="Sair">
            <SignOut size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── Tempo Limpo ────────────────────────────────── */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, flexShrink: 0,
          background: 'var(--duo-blue-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2.5px solid var(--duo-blue)',
        }}>
          <Leaf size={28} weight="duotone" color="var(--duo-blue)" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-3)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            TEMPO LIMPO
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'baseline' }}>
            {anos > 0 && (
              <span>
                <span style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{anos}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 3 }}>ano{anos !== 1 ? 's' : ''}</span>
              </span>
            )}
            {(anos > 0 || meses > 0) && (
              <span>
                <span style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{meses}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 3 }}>mes{meses !== 1 ? 'es' : ''}</span>
              </span>
            )}
            <span>
              <span style={{ fontSize: anos === 0 && meses === 0 ? '2.5rem' : '1.875rem', fontWeight: 900, color: 'var(--duo-blue)', lineHeight: 1 }}>{dias}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 3 }}>dia{dias !== 1 ? 's' : ''}</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            Só por hoje
            <Heart size={13} weight="fill" color="var(--duo-blue)" />
          </p>
        </div>
      </div>

      {/* ── Esta semana ────────────────────────────────── */}
      <SectionHeader
        label="Esta semana"
        right={streak > 0
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--duo-orange)', fontWeight: 800, fontSize: '0.85rem' }}>
              <Fire size={16} weight="fill" />
              {streak} dias
            </div>
          : undefined
        }
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

      {/* ── XP de hoje ─────────────────────────────────── */}
      <SectionHeader
        label="XP de hoje"
        right={
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-2)' }}>
            {nivel.nivel}
          </span>
        }
      />

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 14, background: 'rgba(255,200,0,0.15)' }}>
            <LightningA size={24} weight="fill" color="var(--duo-yellow)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{pontuacaoHoje}</span>
              <span style={{ color: 'var(--text-3)', fontSize: '0.875rem', fontWeight: 700 }}>/100 XP</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>{nivel.mensagem}</div>
          </div>
        </div>
        <div className="duo-bar-wrap">
          <div className="duo-bar-track" />
          <div className="duo-bar-fill" style={{ width: `${Math.max(5, Math.min(100, porcentagem))}%` }}>
            <div className="duo-bar-shine" />
          </div>
        </div>
      </div>

      {/* ── Atividades de hoje ─────────────────────────── */}
      <SectionHeader
        label="Atividades de hoje"
        right={
          <span style={{
            background: doneCount === 3 ? 'var(--duo-green-bg)' : 'var(--bg-card-2)',
            border: `1.5px solid ${doneCount === 3 ? 'var(--duo-green)' : 'var(--border)'}`,
            color: doneCount === 3 ? 'var(--duo-green)' : 'var(--text-3)',
            borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 800,
          }}>
            {doneCount}/3
          </span>
        }
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
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: reunioesHoje > 0 ? 'var(--duo-blue)' : 'var(--text-1)' }}>
              Fui à reunião
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
              {reunioesHoje > 0 ? `${reunioesHoje} reunião(ões) hoje` : 'Registre sua presença'}
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
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: leuHoje ? 'var(--duo-blue)' : 'var(--text-1)' }}>
              Só por hoje
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
              {leuHoje ? 'Leitura concluída hoje' : 'Leia o texto do dia'}
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
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: inventarioHoje ? 'var(--duo-blue)' : 'var(--text-1)' }}>
              10° Passo
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.125rem' }}>
              {inventarioHoje ? 'Inventário feito hoje' : 'Inventário pessoal diário'}
            </div>
          </div>
          {inventarioHoje
            ? <CheckCircle size={22} weight="bold" color="var(--duo-blue)" />
            : <><span className="badge badge-green">+25 XP</span><CaretRight size={16} weight="bold" color="var(--duo-gray)" /></>
          }
        </Link>
      </div>

      {/* ── Streak + Recorde ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card" style={{
          background: streak > 0 ? 'var(--streak-card-bg)' : undefined,
          border: `2px solid ${streak > 0 ? 'rgba(255,150,0,0.35)' : 'var(--border)'}`,
          textAlign: 'center', padding: '1rem',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: streak > 0 ? 'rgba(255,150,0,0.15)' : 'var(--bg-card-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.5rem',
            color: streak > 0 ? 'var(--duo-orange)' : 'var(--duo-gray)',
          }}>
            <Fire size={24} weight="duotone" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: streak > 0 ? 'var(--duo-orange)' : 'var(--duo-gray)', lineHeight: 1 }}>
            {streak}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--duo-gray)', marginTop: '0.25rem', fontWeight: 700 }}>
            {streak > 0 ? 'dias seguidos' : 'Comece hoje!'}
          </div>
        </div>

        <div className="card" style={{
          background: 'var(--trophy-card-bg)',
          border: '2px solid rgba(234,179,8,0.3)',
          textAlign: 'center', padding: '1rem',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(217,119,6,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.5rem', color: '#d97706',
          }}>
            <Trophy size={24} weight="duotone" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{streakMax}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--duo-gray)', marginTop: '0.25rem', fontWeight: 700 }}>
            recorde pessoal
          </div>
          {streak === streakMax && streak > 0 && (
            <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#d97706', fontWeight: 800, fontSize: '0.7rem' }}>
              <Medal size={14} weight="fill" />
              Recorde atual!
            </div>
          )}
        </div>
      </div>

      {/* ── Guia dos Passos ────────────────────────────── */}
      <SectionHeader label="Guia dos Passos" />

      <Link href="/passos" className="task-card task-card--special">
        <div className="task-icon-circle" style={{ background: 'rgba(216,79,158,0.15)', color: 'var(--duo-pink)' }}>
          <ChatCircleText size={26} weight="duotone" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--duo-pink)' }}>
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

function SectionHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 2 }}>
      <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {right}
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
