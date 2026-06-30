'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { hojeEmBRT } from '@/lib/utils'
import {
  Fire, HandWaving,
  CalendarCheck, BookOpenText, ClipboardText, ChatCircleText,
  CaretRight, Avocado, LightningA, UserCircle,
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MESES, DIAS_SEMANA, calcularTempoLimpo } from '@/lib/types'
import ThemeToggle from '@/components/app/ThemeToggle'
import HumorBalloon from '@/components/app/HumorBalloon'
import ModalHumor from '@/components/app/ModalHumor'
import Onboarding from '@/components/app/Onboarding'
import type { HumorKey } from '@/lib/humores'

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
  jaRespondeuHoje: boolean
  humorHoje: string | null
  userId: string
  onboardingConcluido: boolean
}

const DIAS_SEMANA_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getFichaColor(anos: number, meses: number, isDark: boolean): { color: string; bg: string; border: string; shadow?: string } {
  const m = anos * 12 + meses
  if (m >= 24) return isDark
    ? { color: '#ffffff', bg: '#111111', border: '#888888', shadow: '0 3px 0 #555555' }
    : { color: '#1a1a1a', bg: 'rgba(26,26,26,0.08)', border: '#1a1a1a', shadow: '0 3px 0 #1a1a1a' }
  if (m >= 18) return { color: '#6b7280',   bg: 'rgba(107,114,128,0.12)', border: '#6b7280' }
  if (m >= 12) return { color: '#b8ff00',   bg: 'rgba(184,255,0,0.12)',   border: '#b8ff00' }
  if (m >= 9)  return { color: '#f59e0b',   bg: 'rgba(245,158,11,0.12)',  border: '#f59e0b' }
  if (m >= 6)  return { color: '#3b82f6',   bg: 'rgba(59,130,246,0.12)',  border: '#3b82f6' }
  if (m >= 3)  return { color: '#ef4444',   bg: 'rgba(239,68,68,0.12)',   border: '#ef4444' }
  if (m >= 2)  return { color: '#22c55e',   bg: 'rgba(34,197,94,0.12)',   border: '#22c55e' }
  if (m >= 1)  return { color: '#f97316',   bg: 'rgba(249,115,22,0.12)',  border: '#f97316' }
  return         { color: '#d1d5db',   bg: 'rgba(209,213,219,0.15)', border: '#d1d5db' }
}

export default function DashboardClient({
  nome, dataLimpeza, pontuacaoHoje, porcentagem,
  nivel, streak, reunioesHoje, leuHoje, inventarioHoje,
  jaRespondeuHoje: jaRespondeuInicial, humorHoje: humorInicial, userId,
  onboardingConcluido,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [modalHumorAberto, setModalHumorAberto] = useState(false)
  const [jaRespondeuHoje, setJaRespondeuHoje] = useState(jaRespondeuInicial)
  const [humorHoje, setHumorHoje] = useState<string | null>(humorInicial)
  const [mostrarOnboarding, setMostrarOnboarding] = useState(!onboardingConcluido)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const agora = new Date()
  const diaSemana = DIAS_SEMANA[agora.getDay()]
  const dia = agora.getDate()
  const mes = MESES[agora.getMonth()]

  const { anos, meses, dias } = calcularTempoLimpo(dataLimpeza)

  const jsDay = agora.getDay()
  const todayMon = jsDay === 0 ? 6 : jsDay - 1

  function getDayType(i: number): 'done' | 'today-done' | 'today-empty' | 'past-empty' | 'future' {
    if (i > todayMon) return 'future'
    if (i === todayMon) return pontuacaoHoje > 0 ? 'today-done' : 'today-empty'
    const daysBack = todayMon - i
    return daysBack <= streak ? 'done' : 'past-empty'
  }

  async function salvarHumor(humor: HumorKey) {
    const hoje = hojeEmBRT()
    await supabase.from('humores_diarios').upsert(
      { usuario_id: userId, data: hoje, humor },
      { onConflict: 'usuario_id,data' }
    )
    setJaRespondeuHoje(true)
    setHumorHoje(humor)
    setModalHumorAberto(false)
  }

  const saudacao = () => {
    const h = agora.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const doneCount = [reunioesHoje > 0, leuHoje, inventarioHoje].filter(Boolean).length

  return (
    <>
      {mostrarOnboarding && <Onboarding onConcluir={() => setMostrarOnboarding(false)} />}
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
          <button onClick={() => router.push('/perfil')} className="theme-toggle" aria-label="Meu perfil">
            <UserCircle size={20} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── Card de progresso unificado ────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2.5px solid var(--border)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--border)',
        overflow: 'hidden',
      }}>

        {/* Linha 1: Tempo limpo */}
        <div style={{
          padding: '1rem 1.125rem',
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          borderBottom: '2px solid var(--border)',
        }}>
          {(() => {
            const ficha = getFichaColor(anos, meses, isDark)
            return (
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: ficha.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${ficha.border}`,
                ...(ficha.shadow && { boxShadow: ficha.shadow }),
              }}>
                <Avocado size={24} weight="duotone" color={ficha.color} />
              </div>
            )
          })()}
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
              TEMPO LIMPO
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
              {anos > 0 && (
                <span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{anos}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 3 }}>ano{anos !== 1 ? 's' : ''}</span>
                </span>
              )}
              {(anos > 0 || meses > 0) && (
                <span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{meses}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 3 }}>mes{meses !== 1 ? 'es' : ''}</span>
                </span>
              )}
              <span>
                <span style={{ fontSize: anos === 0 && meses === 0 ? '2rem' : '1.5rem', fontWeight: 900, color: 'var(--duo-blue)', lineHeight: 1 }}>{dias}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', marginLeft: 3 }}>dia{dias !== 1 ? 's' : ''}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Linha 2: Esta semana */}
        <div style={{
          padding: '0.875rem 1.125rem',
          borderBottom: '2px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              ESTA SEMANA
            </p>
            {streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--duo-orange)', fontWeight: 800, fontSize: '0.72rem' }}>
                <Fire size={13} weight="fill" />
                {streak} dia{streak !== 1 ? 's' : ''} seguido{streak !== 1 ? 's' : ''}
              </div>
            )}
          </div>
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

        {/* Linha 3: XP de hoje */}
        <div style={{ padding: '0.875rem 1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.1em' }}>
              XP DE HOJE
            </p>
            <span style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-3)' }}>{nivel.nivel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,200,0,0.15)', flexShrink: 0 }}>
              <LightningA size={20} weight="fill" color="var(--duo-yellow)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{pontuacaoHoje}</span>
                <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700 }}>/100 XP</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>{nivel.mensagem}</div>
            </div>
          </div>
          <div className="duo-bar-wrap">
            <div className="duo-bar-track" />
            <div className="duo-bar-fill" style={{ width: `${Math.max(5, Math.min(100, porcentagem))}%` }}>
              <div className="duo-bar-shine" />
            </div>
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
        <ActivityCard
          href="/reuniao"
          icon={<CalendarCheck size={28} weight="duotone" />}
          label="Fui à reunião"
          sublabel={reunioesHoje > 0 ? `${reunioesHoje} reunião(ões) hoje` : 'Registre sua presença'}
          xp="+30 XP"
          done={reunioesHoje > 0}
          accent="#FF9600"
          accentDark="#CC7800"
          accentBg="rgba(255,150,0,0.12)"
        />
        <ActivityCard
          href="/sohoje"
          icon={<BookOpenText size={28} weight="duotone" />}
          label="Só por hoje"
          sublabel={leuHoje ? 'Leitura concluída hoje' : 'Leia o texto do dia'}
          xp="+20 XP"
          done={leuHoje}
          accent="#CE82FF"
          accentDark="#A568CC"
          accentBg="rgba(206,130,255,0.12)"
        />
        <ActivityCard
          href="/decimo-passo"
          icon={<ClipboardText size={28} weight="duotone" />}
          label="Inventário diário"
          sublabel={inventarioHoje ? 'Inventário feito hoje' : 'Inventário pessoal diário'}
          xp="+25 XP"
          done={inventarioHoje}
          accent="#58CC02"
          accentDark="#58A700"
          accentBg="rgba(88,204,2,0.12)"
        />
        <ActivityCard
          href="/passos"
          icon={<ChatCircleText size={28} weight="duotone" />}
          label="Guia dos passos"
          sublabel="Responda perguntas e ganhe XP"
          xp="+15 XP"
          done={false}
          accent="#D84F9E"
          accentDark="#ac016a"
          accentBg="rgba(216,79,158,0.12)"
        />
      </div>

      <HumorBalloon
        jaRespondeuHoje={jaRespondeuHoje}
        humorHoje={humorHoje}
        onAbrir={() => setModalHumorAberto(true)}
      />
      <ModalHumor
        aberto={modalHumorAberto}
        onFechar={() => setModalHumorAberto(false)}
        onSalvar={salvarHumor}
      />
    </div>
    </>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function ActivityCard({
  href, icon, label, sublabel, xp, done, accent, accentDark, accentBg,
}: {
  href: string; icon: React.ReactNode; label: string; sublabel: string
  xp: string; done: boolean; accent: string; accentDark: string; accentBg: string
}) {
  const bg = done ? accentBg : 'var(--bg-card)'
  const border = done ? accent : 'var(--border)'
  const shadowColor = done ? accentDark : 'var(--border)'

  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      padding: '14px 16px', gap: 14, borderRadius: 16,
      background: bg,
      border: `2.5px solid ${border}`,
      boxShadow: `0 4px 0 ${shadowColor}`,
      textDecoration: 'none', width: '100%', boxSizing: 'border-box',
      transition: 'transform 0.1s, box-shadow 0.1s',
    }}
    onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 0 ${shadowColor}` }}
    onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 0 ${shadowColor}` }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 0 ${shadowColor}` }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: done ? `${accent}25` : accentBg,
        color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: done ? accent : 'var(--text-1)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--duo-gray)', marginTop: '0.25rem', fontWeight: 600 }}>
          {sublabel}
        </div>
      </div>
      {done
        ? <div style={{ width: 28, height: 28, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        : <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ background: `${accent}20`, color: accent, padding: '3px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800 }}>{xp}</span>
            <CaretRight size={16} weight="bold" color="var(--duo-gray)" />
          </div>
      }
    </Link>
  )
}

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
