'use client'
import { useState, useRef } from 'react'
import {
  HandHeart, Trophy, UsersFour, BookOpenText,
  ChatCircleText, ClipboardText, ShieldCheck, Rocket,
} from '@phosphor-icons/react'
import { concluirOnboarding } from '@/app/actions/onboarding'

const SLIDES = [
  {
    Icon: HandHeart,
    cor: 'var(--duo-green)',
    titulo: 'Bem-vindo(a) ao RAD',
    texto: 'RAD significa Recuperação Ativa Diária. Este app foi feito para membros de Narcóticos Anônimos que querem praticar e fortalecer sua recuperação todos os dias, de forma simples e gamificada.',
  },
  {
    Icon: Trophy,
    cor: 'var(--duo-orange)',
    titulo: 'Sua recuperação em pontos',
    texto: 'Cada atividade gera pontos. Sua pontuação vai de 0 a 100 e mostra a qualidade da sua recuperação no dia. Ela zera toda meia-noite — porque a recuperação se pratica um dia de cada vez.',
  },
  {
    Icon: UsersFour,
    cor: 'var(--duo-blue)',
    titulo: 'Registre suas reuniões',
    texto: 'Toda vez que você for a uma reunião de NA, faça check-in no app. Você indica o tipo de reunião e avalia o quanto queria estar lá e o quanto fez bem. Se foi sem querer e foi assim mesmo, ganha pontos bônus.',
  },
  {
    Icon: BookOpenText,
    cor: '#7d88e6',
    titulo: 'Leitura diária',
    texto: 'Todo dia tem um texto do livro Só por Hoje disponível para ler dentro do app. Ao marcar como lido, você registra mais um dia de prática e ganha pontos.',
  },
  {
    Icon: ChatCircleText,
    cor: 'var(--duo-green)',
    titulo: 'Guia dos 12 Passos',
    texto: 'O app contém todas as perguntas do Guia para Trabalhar os Passos de NA organizadas por passo e tópico. Você responde no seu ritmo em modo foco, uma por vez. Suas respostas ficam salvas para revisitar quando quiser.',
  },
  {
    Icon: ClipboardText,
    cor: 'var(--duo-purple)',
    titulo: '10° Passo e humor diário',
    texto: 'Uma vez por dia você responde o inventário do 10° Passo com 5 perguntas de reflexão. O app também pergunta como você está se sentindo — 13 estados emocionais para registrar. Tudo fica no seu histórico.',
  },
  {
    Icon: ShieldCheck,
    cor: 'var(--duo-blue)',
    titulo: 'Suas respostas são completamente suas',
    texto: 'Todas as suas respostas — do guia dos passos, do inventário e do 10° Passo — são criptografadas. Nem os desenvolvedores conseguem lê-las. Escreva com total liberdade e segurança.',
  },
  {
    Icon: Rocket,
    cor: 'var(--duo-orange)',
    titulo: 'Pronto para começar?',
    texto: 'Explore no seu ritmo. Quanto mais você pratica, mais forte fica sua recuperação. Só por hoje — um dia de cada vez.',
  },
] as const

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

  const { Icon, cor, titulo, texto } = SLIDES[slide]

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
        padding: '1.5rem 2rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}>
        {/* Ícone */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: `color-mix(in srgb, ${cor} 15%, transparent)`,
          border: `2px solid color-mix(in srgb, ${cor} 30%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={38} weight="duotone" color={cor} />
        </div>

        {/* Texto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 340 }}>
          <h2 style={{
            fontSize: '1.35rem', fontWeight: 900,
            color: 'var(--text-1)', lineHeight: 1.25,
          }}>
            {titulo}
          </h2>
          <p style={{
            fontSize: '0.925rem', color: 'var(--text-2)',
            lineHeight: 1.7, fontWeight: 500,
          }}>
            {texto}
          </p>
        </div>
      </div>

      {/* Footer: bolinhas + botão */}
      <div style={{
        flexShrink: 0,
        padding: '1rem 1.5rem',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
      }}>
        {/* Indicadores */}
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
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
          ))}
        </div>

        {/* Botão Próximo / Começar */}
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
