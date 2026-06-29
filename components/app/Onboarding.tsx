'use client'
import { useState, useRef } from 'react'
import {
  HandHeart, Trophy, UsersFour, BookOpenText,
  ChatCircleText, ClipboardText, ShieldCheck, Rocket,
} from '@phosphor-icons/react'
import { concluirOnboarding } from '@/app/actions/onboarding'

type SlideSimples = {
  tipo?: 'simples'
  Icon: React.ElementType
  cor: string
  titulo: string
  texto: string
}

type SlideFuncionalidades = {
  tipo: 'funcionalidades'
  titulo: string
  itens: { Icon: React.ElementType; cor: string; label: string; desc: string }[]
}

type Slide = SlideSimples | SlideFuncionalidades

const SLIDES: Slide[] = [
  {
    Icon: HandHeart,
    cor: 'var(--duo-green)',
    titulo: 'Bem-vindo(a) ao RAD',
    texto: 'RAD significa Recuperação Ativa Diária. Este app foi feito para membros de Narcóticos Anônimos que querem praticar e fortalecer sua recuperação todos os dias, de forma simples e gamificada.',
  },
  {
    tipo: 'funcionalidades',
    titulo: 'O que você pode fazer aqui',
    itens: [
      { Icon: UsersFour,    cor: 'var(--duo-blue)',   label: 'Check-in de reunião', desc: 'Registre cada reunião de NA que você foi' },
      { Icon: BookOpenText, cor: '#7d88e6',            label: 'Leitura diária',      desc: 'Texto do Só por Hoje disponível todo dia' },
      { Icon: ClipboardText,cor: 'var(--duo-purple)', label: 'Inventário diário',   desc: '10° Passo e registro do seu humor' },
      { Icon: ChatCircleText,cor: 'var(--duo-green)', label: 'Guia dos Passos',     desc: 'Todas as perguntas dos 12 Passos de NA' },
    ],
  },
  {
    Icon: ShieldCheck,
    cor: 'var(--duo-blue)',
    titulo: 'Suas respostas são completamente suas',
    texto: 'Todas as suas respostas — do guia dos passos, do inventário e do 10° Passo — são criptografadas. Nem os desenvolvedores conseguem lê-las. Escreva com total liberdade e segurança.',
  },
  {
    Icon: Trophy,
    cor: 'var(--duo-orange)',
    titulo: 'Sua recuperação em pontos',
    texto: 'Cada atividade gera pontos. Sua pontuação vai de 0 a 100 e mostra a qualidade da sua recuperação no dia. Ela zera toda meia-noite — porque a recuperação se pratica um dia de cada vez.',
  },
  {
    Icon: Rocket,
    cor: 'var(--duo-orange)',
    titulo: 'Pronto para começar?',
    texto: 'Explore no seu ritmo. Quanto mais você pratica, mais forte fica sua recuperação. Só por hoje — um dia de cada vez.\n\nDica: ative as notificações no seu Perfil para receber lembretes diários.',
  },
]

interface Props {
  onConcluir: () => void
}

export default function Onboarding({ onConcluir }: Props) {
  const [slide, setSlide] = useState(0)
  const [saindo, setSaindo] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const total = SLIDES.length
  const ehUltimo = slide === total - 1

  async function fechar() {
    setSaindo(true)
    await concluirOnboarding()
    onConcluir()
  }

  function avancar() {
    if (ehUltimo) { fechar(); return }
    setSlide(s => s + 1)
  }

  function voltar() {
    if (slide > 0) setSlide(s => s - 1)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 50) return
    if (diff > 0) avancar()
    else voltar()
    touchStartX.current = null
  }

  const atual = SLIDES[slide]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Botão Pular */}
      <div style={{
        flexShrink: 0,
        display: 'flex', justifyContent: 'flex-end',
        padding: '1rem 1.25rem 0',
      }}>
        <button
          onClick={fechar}
          style={{
            background: 'var(--bg-card-2)',
            border: '1.5px solid var(--border)',
            borderRadius: 99,
            padding: '0.375rem 0.875rem',
            fontSize: '0.78rem', fontWeight: 800,
            color: 'var(--text-3)',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          Pular
        </button>
      </div>

      {/* Conteúdo central */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem 1.75rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}>
        {atual.tipo === 'funcionalidades' ? (
          <>
            <h2 style={{
              fontSize: '1.35rem', fontWeight: 900,
              color: 'var(--text-1)', lineHeight: 1.25,
            }}>
              {atual.titulo}
            </h2>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem', width: '100%', maxWidth: 340,
            }}>
              {atual.itens.map(({ Icon, cor, label, desc }) => (
                <div key={label} style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  borderRadius: 16,
                  boxShadow: '0 3px 0 var(--border)',
                  padding: '0.875rem 0.75rem',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-start', gap: '0.5rem',
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `color-mix(in srgb, ${cor} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} weight="duotone" color={cor} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2, marginBottom: 2 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, lineHeight: 1.4 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: `color-mix(in srgb, ${atual.cor} 15%, transparent)`,
              border: `2px solid color-mix(in srgb, ${atual.cor} 30%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <atual.Icon size={38} weight="duotone" color={atual.cor} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 340 }}>
              <h2 style={{
                fontSize: '1.35rem', fontWeight: 900,
                color: 'var(--text-1)', lineHeight: 1.25,
              }}>
                {atual.titulo}
              </h2>
              <p style={{
                fontSize: '0.925rem', color: 'var(--text-2)',
                lineHeight: 1.7, fontWeight: 500, whiteSpace: 'pre-line',
              }}>
                {atual.texto}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer: bolinhas + botão */}
      <div style={{
        flexShrink: 0,
        padding: '1rem 1.5rem',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => {
            const cor = atual.tipo === 'funcionalidades' ? 'var(--duo-blue)' : (atual as SlideSimples).cor
            return (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  width: i === slide ? 20 : 7,
                  height: 7, borderRadius: 99,
                  background: i === slide ? cor : 'var(--border)',
                  border: 'none', padding: 0, cursor: 'pointer',
                  transition: 'width 0.25s ease, background 0.25s ease',
                }}
              />
            )
          })}
        </div>

        <button
          onClick={avancar}
          disabled={saindo}
          className="btn-primary"
          style={{ width: '100%', maxWidth: 340 }}
        >
          {ehUltimo ? 'Começar' : 'Próximo →'}
        </button>
      </div>
    </div>
  )
}
