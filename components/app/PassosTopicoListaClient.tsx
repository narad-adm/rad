'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpenText, Warning, Heart, Fire, ClipboardText,
  HandsPraying, Circle, CaretRight, CheckCircle, ArrowLeft,
} from '@phosphor-icons/react'
import { NOMES_PASSOS } from '@/lib/types'

interface Topico {
  nome: string
  slug: string
  total: number
  feitas: number
}

interface Props {
  passo: number
  topicos: Topico[]
  totalPerguntas: number
  totalFeitas: number
}

function getTopicoIcon(nome: string) {
  const lower = nome.toLowerCase()
  if (lower.includes('princíp') || lower.includes('principi')) return BookOpenText
  if (lower.includes('medo')) return Warning
  if (lower.includes('sex') || lower.includes('amor') || lower.includes('relacion')) return Heart
  if (lower.includes('ressenti') || lower.includes('raiva') || lower.includes('ódio')) return Fire
  if (lower.includes('inventário') || lower.includes('inventario')) return ClipboardText
  if (lower.includes('rendição') || lower.includes('rendicao') || lower.includes('entrega') || lower.includes('humild')) return HandsPraying
  return Circle
}

export default function PassosTopicoListaClient({
  passo, topicos, totalPerguntas, totalFeitas,
}: Props) {
  const router = useRouter()
  const pct = totalPerguntas > 0 ? Math.round((totalFeitas / totalPerguntas) * 100) : 0
  const nomePasso = NOMES_PASSOS[passo]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Link href="/passos" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 700,
          textDecoration: 'none', marginBottom: '0.75rem',
        }}>
          <ArrowLeft size={14} weight="bold" />
          Passos
        </Link>
        <h1 style={{ color: 'var(--text-1)', fontSize: '1.4rem', fontWeight: 900 }}>{nomePasso}</h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: 2 }}>
          {pct}% concluído · {totalFeitas} de {totalPerguntas} perguntas
        </p>
      </div>

      {/* Barra geral do passo */}
      <div style={{ height: 10, background: 'var(--duo-gray-light)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: pct === 100 ? 'var(--duo-green)' : 'var(--duo-blue)',
          borderRadius: 99, width: `${pct}%`, transition: 'width 0.8s ease',
          minWidth: pct > 0 ? 10 : 0,
        }} />
      </div>

      {/* Lista de tópicos */}
      <div className="space-y-3">
        {topicos.map(({ nome, slug, total, feitas }) => {
          const topicoPct = total > 0 ? Math.round((feitas / total) * 100) : 0
          const concluido = feitas === total && total > 0
          const iniciado = feitas > 0 && !concluido
          const Icon = getTopicoIcon(nome)

          return (
            <button
              key={slug}
              onClick={() => router.push(`/passos/${passo}/${slug}`)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                background: 'var(--bg-card)',
                border: `2px solid ${concluido ? 'var(--duo-green)' : iniciado ? 'var(--duo-blue)' : 'var(--border)'}`,
                borderRadius: 16, padding: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: concluido ? 'var(--duo-green-bg)' : iniciado ? 'var(--duo-blue-bg)' : 'var(--bg-card-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: concluido ? 'var(--duo-green)' : iniciado ? 'var(--duo-blue)' : 'var(--text-3)',
              }}>
                <Icon size={20} weight="duotone" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)', marginBottom: 3 }}>
                  {nome}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 6 }}>
                  {feitas} de {total} perguntas respondidas
                </div>
                <div style={{ height: 4, background: 'var(--duo-gray-light)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${topicoPct}%`,
                    background: concluido ? 'var(--duo-green)' : 'var(--duo-blue)',
                    minWidth: topicoPct > 0 ? 4 : 0,
                  }} />
                </div>
                {concluido && (
                  <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'var(--duo-green-bg)', color: 'var(--duo-green)',
                    fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>
                    <CheckCircle size={9} weight="bold" /> Concluído
                  </div>
                )}
                {iniciado && !concluido && (
                  <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'var(--duo-blue-bg)', color: 'var(--duo-blue)',
                    fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>
                    Em andamento
                  </div>
                )}
              </div>

              <CaretRight size={16} weight="bold" color="var(--text-3)" style={{ flexShrink: 0 }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
