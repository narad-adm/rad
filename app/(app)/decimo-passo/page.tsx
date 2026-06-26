'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ClipboardText, CheckCircle } from '@phosphor-icons/react'

const PERGUNTAS = [
  { key: 'honestidade',   titulo: '🔍 Honestidade',      pergunta: 'Onde fui honesto hoje? E onde fui desonesto?' },
  { key: 'admissoes',     titulo: '🙏 Admissões',         pergunta: 'O que preciso admitir, reparar ou melhorar?' },
  { key: 'contribuicoes', titulo: '💙 Contribuições',     pergunta: 'Contribuí positivamente para mim e para os outros? E negativamente?' },
  { key: 'doenca',        titulo: '⚠️ Minha doença',      pergunta: 'Tive vontade de usar? Minha doença se manifestou de alguma forma hoje? Como?' },
  { key: 'acoes_limpeza', titulo: '✨ Minha recuperação', pergunta: 'O que fiz hoje para me manter limpo(a)?' },
]

export default function DecimoPasso() {
  const router = useRouter()
  const supabase = createClient()
  const [jaFez, setJaFez] = useState(false)
  const [respostas, setRespostas] = useState<Record<string, string>>({
    honestidade: '', admissoes: '', contribuicoes: '', doenca: '', acoes_limpeza: ''
  })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [celebrar, setCelebrar] = useState(false)

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const hoje = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('inventarios_diarios')
        .select('*').eq('usuario_id', user.id).eq('data', hoje).single()

      if (data) {
        setJaFez(true)
        setRespostas({
          honestidade:   data.honestidade   ?? '',
          admissoes:     data.admissoes     ?? '',
          contribuicoes: data.contribuicoes ?? '',
          doenca:        data.doenca        ?? '',
          acoes_limpeza: data.acoes_limpeza ?? '',
        })
      }
      setLoading(false)
    }
    verificar()
  }, [])

  async function handleSalvar() {
    setSalvando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const hoje = new Date().toISOString().split('T')[0]

    await supabase.from('inventarios_diarios').insert({
      usuario_id: user.id, data: hoje, ...respostas, pontos_ganhos: 25,
    })

    const { data } = await supabase.from('pontuacao_diaria')
      .select('*').eq('usuario_id', user.id).eq('data', hoje).single()

    if (data) {
      await supabase.from('pontuacao_diaria').update({
        pontos_total: Math.min(100, data.pontos_total + 25),
        inventarios: data.inventarios + 1,
        atualizado_em: new Date().toISOString(),
      }).eq('id', data.id)
    } else {
      await supabase.from('pontuacao_diaria').insert({
        usuario_id: user.id, data: hoje, pontos_total: 25, inventarios: 1,
      })
    }

    setJaFez(true)
    setCelebrar(true)
    setSalvando(false)
    setTimeout(() => setCelebrar(false), 3000)
  }

  const temAlgumaResposta = Object.values(respostas).some(r => r.trim().length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📝</div>
          <p style={{ color: 'var(--text-3)' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            INVENTÁRIO DIÁRIO
          </p>
          <h1 style={{ color: 'var(--text-1)', fontSize: '1.5rem', fontWeight: 900 }}>10° Passo</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.125rem' }}>
            Continuamos a fazer o inventário pessoal
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #8a81e5, #b280e6)' }}>
          <ClipboardText size={22} weight="duotone" color="white" />
        </div>
      </div>

      {celebrar && (
        <div className="pop-in text-center py-3 rounded-2xl"
             style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="text-2xl">🌟</span>
          <span className="text-sm ml-2 font-bold" style={{ color: 'var(--success)' }}>
            +25 pontos! Inventário feito!
          </span>
        </div>
      )}

      <div className="space-y-4">
        {PERGUNTAS.map(({ key, titulo, pergunta }) => (
          <div key={key} className="card space-y-3">
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)' }}>{titulo}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>{pergunta}</p>
            </div>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Escreva aqui sua reflexão..."
              value={respostas[key]}
              onChange={e => setRespostas(prev => ({ ...prev, [key]: e.target.value }))}
              disabled={jaFez}
              style={{ resize: 'none', opacity: jaFez ? 0.7 : 1 }}
            />
          </div>
        ))}
      </div>

      {jaFez ? (
        <div className="flex items-center justify-center gap-2 py-4 rounded-2xl"
             style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle size={20} weight="bold" color="#22c55e" />
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--success)' }}>
            Inventário de hoje concluído!
          </span>
        </div>
      ) : (
        <button onClick={handleSalvar} disabled={salvando || !temAlgumaResposta} className="btn-primary">
          {salvando ? 'Salvando...' : '✓ Salvar inventário (+25 pts)'}
        </button>
      )}
    </div>
  )
}
