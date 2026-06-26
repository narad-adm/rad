'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ClipboardList, CheckCircle } from 'lucide-react'

const PERGUNTAS = [
  { key: 'honestidade',   titulo: '🔍 Honestidade',     pergunta: 'Onde fui honesto hoje? E onde fui desonesto?' },
  { key: 'admissoes',     titulo: '🙏 Admissões',        pergunta: 'O que preciso admitir, reparar ou melhorar?' },
  { key: 'contribuicoes', titulo: '💙 Contribuições',    pergunta: 'Contribuí positivamente para mim e para os outros? E negativamente?' },
  { key: 'doenca',        titulo: '⚠️ Minha doença',     pergunta: 'Tive vontade de usar? Minha doença se manifestou de alguma forma hoje? Como?' },
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
      usuario_id: user.id,
      data: hoje,
      ...respostas,
      pontos_ganhos: 25,
    })

    // Atualizar pontuação
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
        usuario_id: user.id, data: hoje,
        pontos_total: 25, inventarios: 1,
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
          <p style={{ color: 'rgba(241,245,249,0.4)' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(241,245,249,0.4)' }}>
            INVENTÁRIO DIÁRIO
          </p>
          <h1 className="text-2xl font-black text-white">10° Passo</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>
            Continuamos a fazer o inventário pessoal
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(167,139,250,0.15))' }}>
          <ClipboardList size={22} color="#a78bfa" />
        </div>
      </div>

      {celebrar && (
        <div className="text-center py-3 rounded-2xl"
             style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <span className="text-2xl">🌟</span>
          <span className="text-sm ml-2 font-bold" style={{ color: '#34d399' }}>
            +25 pontos! Inventário feito!
          </span>
        </div>
      )}

      <div className="space-y-4">
        {PERGUNTAS.map(({ key, titulo, pergunta }) => (
          <div key={key} className="card-rad space-y-3">
            <div>
              <p className="font-bold text-sm text-white">{titulo}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>{pergunta}</p>
            </div>
            <textarea
              className="input-rad"
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
             style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <CheckCircle size={20} color="#34d399" />
          <span className="font-semibold text-sm" style={{ color: '#34d399' }}>
            Inventário de hoje concluído!
          </span>
        </div>
      ) : (
        <button onClick={handleSalvar} disabled={salvando || !temAlgumaResposta} className="btn-rad">
          {salvando ? 'Salvando...' : '✓ Salvar inventário (+25 pts)'}
        </button>
      )}
    </div>
  )
}
