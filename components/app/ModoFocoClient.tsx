'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Microphone, Stop } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { hojeEmBRT } from '@/lib/utils'
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

  const [micState, setMicState] = useState<MicState>('idle')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const pergunta = perguntas[perguntaAtual]
  const respondidosNoTopico = perguntas.filter(p => respostasMap[p.id]).length
  const progressoPct = perguntas.length > 0 ? (respondidosNoTopico / perguntas.length) * 100 : 0

  // ── Auto-save ──────────────────────────────────────────
  const atualizarPontuacao = useCallback(async () => {
    const hoje = hojeEmBRT()
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

  async function handleMic() {
    if (micState === 'idle') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mr = new MediaRecorder(stream)
        chunksRef.current = []
        mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        mr.onstop = async () => {
          stream.getTracks().forEach(t => t.stop())
          setMicState('transcribing')
          const blob = new Blob(chunksRef.current, { type: mr.mimeType })
          const form = new FormData()
          form.append('audio', blob, 'audio')
          try {
            const res = await fetch('/api/transcrever', { method: 'POST', body: form })
            const json = await res.json()
            if (json.texto) {
              setRascunho(prev => prev ? `${prev} ${json.texto}` : json.texto)
            }
          } finally {
            setMicState('idle')
          }
        }
        mr.start()
        mediaRecorderRef.current = mr
        setMicState('recording')
      } catch {
        setMicState('idle')
      }
    } else if (micState === 'recording') {
      mediaRecorderRef.current?.stop()
    }
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

      {/* ── Voice button ── */}
      <div style={{ flexShrink: 0, padding: '0.5rem 1rem 0' }}>
        <VoiceButton state={micState} onClick={handleMic} />
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

// ── Waveform bars config (from design) ───────────────────────────────────────
const BARS: { bgH: number; fgH: number }[] = [
  { bgH: 19, fgH: 14 },
  { bgH: 26, fgH: 20 },
  { bgH: 63, fgH: 47 },
  { bgH: 68, fgH: 52 },
  { bgH: 37, fgH: 28 },
  { bgH: 57, fgH: 43 },
  { bgH: 34, fgH: 26 },
  { bgH: 19, fgH: 16 },
  { bgH: 12, fgH:  9 },
]
const MAX_H = 68

type MicState = 'idle' | 'recording' | 'transcribing'

function VoiceButton({ state, onClick }: { state: MicState; onClick: () => void }) {
  const isIdle = state === 'idle'
  const isRecording = state === 'recording'
  const isProcessing = state === 'transcribing'

  return (
    <>
      <style>{`
        @keyframes vbar {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1); }
        }
        @keyframes vbar-proc {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* outer shadow track */}
      <div style={{
        background: '#E5E5E5',
        borderRadius: 13,
        padding: '1.5px',
        width: '100%',
      }}>
        <button
          onClick={onClick}
          disabled={false}
          style={{
            width: '100%',
            height: 64,
            borderRadius: 13,
            border: '2px solid #E5E5E5',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'border-color 0.2s',
          }}
        >
          {isIdle && (
            <>
              {/* Mic icon — matches Figma: rect body + arc */}
              <svg width="15" height="22" viewBox="0 0 15 22" fill="none">
                <rect x="2.14" y="0" width="10.72" height="15.13" rx="5.36" fill="#1CB0F6" />
                <path d="M0 9.28C0 13.72 3.36 17.32 7.5 17.32C11.64 17.32 15 13.72 15 9.28" stroke="#1CB0F6" strokeWidth="2" fill="none" strokeLinecap="round" />
                <line x1="7.5" y1="17.32" x2="7.5" y2="22" stroke="#1CB0F6" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1CB0F6' }}>
                Gravar resposta
              </span>
            </>
          )}

          {isRecording && (
            <>
              {/* Waveform animated */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: MAX_H }}>
                {BARS.map((bar, i) => (
                  <div key={i} style={{ position: 'relative', width: 8, height: MAX_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* bg bar */}
                    <div style={{
                      position: 'absolute',
                      width: 8,
                      height: bar.bgH,
                      background: '#DDF4FF',
                      borderRadius: 24,
                      transformOrigin: 'center',
                      animation: `vbar ${0.6 + i * 0.07}s ease-in-out infinite`,
                      animationDelay: `${i * 0.06}s`,
                    }} />
                    {/* fg bar */}
                    <div style={{
                      position: 'absolute',
                      width: 8,
                      height: bar.fgH,
                      background: '#1CB0F6',
                      borderRadius: 24,
                      transformOrigin: 'center',
                      animation: `vbar ${0.6 + i * 0.07}s ease-in-out infinite`,
                      animationDelay: `${i * 0.06 + 0.05}s`,
                    }} />
                  </div>
                ))}
              </div>
              <Stop size={16} weight="bold" color="#1CB0F6" style={{ marginLeft: 8 }} />
            </>
          )}

          {isProcessing && (
            <>
              {/* Bars pulsing uniformly = "IA pensando" */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: MAX_H }}>
                {BARS.map((bar, i) => (
                  <div key={i} style={{ position: 'relative', width: 8, height: MAX_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      position: 'absolute',
                      width: 8,
                      height: bar.bgH,
                      background: '#DDF4FF',
                      borderRadius: 24,
                    }} />
                    <div style={{
                      position: 'absolute',
                      width: 8,
                      height: bar.fgH,
                      background: '#1CB0F6',
                      borderRadius: 24,
                      animation: `vbar-proc 0.8s ease-in-out infinite`,
                      animationDelay: `${i * 0.08}s`,
                    }} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1CB0F6', marginLeft: 8 }}>
                Processando...
              </span>
            </>
          )}
        </button>
      </div>
    </>
  )
}
