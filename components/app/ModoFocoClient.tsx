'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { inserirRespostaPasso, atualizarRespostaPasso } from '@/app/actions/respostas'
import type { PassoPergunta } from '@/lib/types'

interface RespostaInfo {
  id: string
  texto: string
}

interface Props {
  passo: number
  nomePasso: string
  topicoNome: string
  topicoSlug: string
  perguntas: PassoPergunta[]
  respostasIniciais: Record<string, RespostaInfo>
  userId: string
}

export default function ModoFocoClient({
  passo, nomePasso, topicoNome, topicoSlug,
  perguntas, respostasIniciais, userId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Find first unanswered question
  const primeiraIdx = (() => {
    const idx = perguntas.findIndex(p => !respostasIniciais[p.id])
    return idx === -1 ? perguntas.length - 1 : idx
  })()

  const [perguntaAtual, setPerguntaAtual] = useState(primeiraIdx)
  const [respostasMap, setRespostasMap] = useState<Record<string, RespostaInfo>>(respostasIniciais)
  const [rascunho, setRascunho] = useState(respostasIniciais[perguntas[primeiraIdx]?.id]?.texto ?? '')
  const [salvando, setSalvando] = useState(false)
  const [ultimoSalvo, setUltimoSalvo] = useState<Date | null>(null)
  const [mostrarSalvo, setMostrarSalvo] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)

  const pergunta = perguntas[perguntaAtual]
  const respondidosNoTopico = perguntas.filter(p => respostasMap[p.id]).length
  const progressoPct = perguntas.length > 0 ? (respondidosNoTopico / perguntas.length) * 100 : 0

  // ── Auto-save ──────────────────────────────────────────
  const atualizarPontuacao = useCallback(async () => {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('pontuacao_diaria')
      .select('*').eq('usuario_id', userId).eq('data', hoje).single()
    if (data) {
      await supabase.from('pontuacao_diaria').update({
        pontos_total: Math.min(100, data.pontos_total + 15),
        passos: (data.passos ?? 0) + 1,
        atualizado_em: new Date().toISOString(),
      }).eq('id', data.id)
    } else {
      await supabase.from('pontuacao_diaria').insert({
        usuario_id: userId, data: hoje, pontos_total: 15, passos: 1,
      })
    }
  }, [userId, supabase])

  const salvarRascunho = useCallback(async (perguntaId: string, texto: string) => {
    if (!texto.trim()) return
    const salvo = respostasMap[perguntaId]
    if (texto === salvo?.texto) return

    setSalvando(true)
    try {
      if (salvo) {
        await atualizarRespostaPasso(salvo.id, texto)
        setRespostasMap(prev => ({ ...prev, [perguntaId]: { id: salvo.id, texto } }))
      } else {
        const data = await inserirRespostaPasso(perguntaId, texto)
        if (data) {
          setRespostasMap(prev => ({ ...prev, [perguntaId]: { id: data.id, texto } }))
          await atualizarPontuacao()
        }
      }
      setUltimoSalvo(new Date())
      setMostrarSalvo(true)
      setTimeout(() => setMostrarSalvo(false), 2000)
    } finally {
      setSalvando(false)
    }
  }, [respostasMap, userId, supabase, atualizarPontuacao])

  // Debounced auto-save
  useEffect(() => {
    if (!pergunta) return
    if (timerRef.current) clearTimeout(timerRef.current)
    const pId = pergunta.id
    const salvo = respostasMap[pId]?.texto ?? ''
    if (rascunho === salvo) return

    timerRef.current = setTimeout(() => {
      salvarRascunho(pId, rascunho)
    }, 1500)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [rascunho]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ─────────────────────────────────────────
  async function irParaPergunta(idx: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    // Save immediately before navigating
    await salvarRascunho(pergunta.id, rascunho)

    setPerguntaAtual(idx)
    setFadeKey(k => k + 1)
    const proxTexto = respostasMap[perguntas[idx].id]?.texto ?? ''
    setRascunho(proxTexto)
    // Scroll textarea to top
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.scrollTop = 0
    }, 50)
  }

  async function handleVoltar() {
    if (timerRef.current) clearTimeout(timerRef.current)
    await salvarRascunho(pergunta.id, rascunho)
    router.push(`/passos/${passo}`)
  }

  async function handleConcluir() {
    if (timerRef.current) clearTimeout(timerRef.current)
    await salvarRascunho(pergunta.id, rascunho)
    router.push(`/passos/${passo}`)
  }

  const ehUltima = perguntaAtual === perguntas.length - 1
  const ehPrimeira = perguntaAtual === 0

  if (!pergunta) return null

  const textoLongo = pergunta.pergunta.length > 200

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
    }}>
      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 1rem', gap: '0.75rem',
        background: 'var(--bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'relative', zIndex: 1,
      }}>
        <button
          onClick={handleVoltar}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-card-2)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-2)', flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} weight="bold" />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {nomePasso} › {topicoNome}
          </p>
        </div>

        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-3)', flexShrink: 0 }}>
          {perguntaAtual + 1} / {perguntas.length}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 4, background: 'var(--duo-gray-light)', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${progressoPct}%`,
          background: progressoPct === 100 ? 'var(--duo-green)' : 'var(--duo-blue)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── Content area ── */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        padding: '1.25rem 1rem 0.5rem',
      }}>
        {/* Pergunta */}
        <div
          key={fadeKey}
          style={{ animation: 'fadeIn 0.2s ease', flexShrink: 0, marginBottom: '1rem' }}
        >
          <p style={{
            fontSize: textoLongo ? '1rem' : '1.15rem',
            fontWeight: 600,
            lineHeight: 1.65,
            color: 'var(--text-1)',
          }}>
            {pergunta.pergunta}
          </p>
        </div>

        {/* Textarea wrapper */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <textarea
            ref={textareaRef}
            value={rascunho}
            onChange={e => setRascunho(e.target.value)}
            placeholder="Escreva sua reflexão aqui..."
            style={{
              flex: 1,
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              borderRadius: 16,
              padding: '1rem',
              fontSize: '1rem',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 400,
              lineHeight: 1.7,
              resize: 'none',
              color: 'var(--text-1)',
              outline: 'none',
              minHeight: 120,
              width: '100%',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--duo-blue)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />

          {/* Auto-save indicator */}
          <div style={{
            position: 'absolute', bottom: 10, right: 12,
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.68rem', fontWeight: 700,
            pointerEvents: 'none',
          }}>
            {salvando && (
              <>
                <div className="spin-indicator" />
                <span style={{ color: 'var(--text-3)' }}>Salvando...</span>
              </>
            )}
            {!salvando && mostrarSalvo && (
              <span style={{ color: 'var(--duo-green)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <CheckCircle size={11} weight="bold" />
                Salvo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0,
        padding: '0.75rem 1rem',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '0.75rem',
      }}>
        <button
          onClick={() => irParaPergunta(perguntaAtual - 1)}
          disabled={ehPrimeira}
          className="btn-ghost"
          style={{ flex: 1, opacity: ehPrimeira ? 0.3 : 1 }}
        >
          ← Anterior
        </button>

        {ehUltima ? (
          <button
            onClick={handleConcluir}
            style={{
              flex: 1, height: 48, borderRadius: 13,
              background: 'var(--duo-green)',
              border: 'none',
              borderBottom: '4px solid var(--duo-green-dark)',
              color: 'white', fontFamily: 'Nunito, sans-serif',
              fontWeight: 800, fontSize: '1rem',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <CheckCircle size={18} weight="bold" />
            Concluir
          </button>
        ) : (
          <button
            onClick={() => irParaPergunta(perguntaAtual + 1)}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            Próxima →
          </button>
        )}
      </div>
    </div>
  )
}
