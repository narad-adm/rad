'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Users, Layers, BookOpen, CalendarDays, Book, Star, Circle } from 'lucide-react'
import type { TipoReuniao } from '@/lib/types'

const ICONES: Record<string, any> = {
  Users, Layers, BookOpen, CalendarDays, Book, Star, Circle
}

export default function ReuniaoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tipos, setTipos] = useState<TipoReuniao[]>([])
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoReuniao | null>(null)
  const [notaQuerer, setNotaQuerer] = useState<number>(5)
  const [notaBeneficio, setNotaBeneficio] = useState<number>(5)
  const [observacao, setObservacao] = useState('')
  const [etapa, setEtapa] = useState<'tipo' | 'notas' | 'sucesso'>('tipo')
  const [loading, setLoading] = useState(false)
  const [pontosGanhos, setPontosGanhos] = useState(0)

  useEffect(() => {
    supabase.from('tipos_reuniao').select('*').order('pontos', { ascending: false })
      .then(({ data }) => setTipos(data ?? []))
  }, [])

  async function handleRegistrar() {
    if (!tipoSelecionado) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const hoje = new Date().toISOString().split('T')[0]
    const hora = new Date().toTimeString().slice(0, 5)

    // Bônus de resistência: foi mas não queria (nota < 5)
    const bonus = notaQuerer < 5 ? 20 : 0
    const pontos = tipoSelecionado.pontos + bonus

    const { error } = await supabase.from('checkins_reuniao').insert({
      usuario_id: user.id,
      tipo_reuniao_id: tipoSelecionado.id,
      data: hoje,
      hora,
      nota_querer: notaQuerer,
      nota_beneficio: notaBeneficio,
      observacao: observacao.trim() || null,
      pontos_ganhos: pontos,
    })

    if (!error) {
      // Atualizar pontuação diária
      await atualizarPontuacao(user.id, hoje, pontos)
      setPontosGanhos(pontos)
      setEtapa('sucesso')
    }
    setLoading(false)
  }

  async function atualizarPontuacao(userId: string, hoje: string, pontos: number) {
    const { data } = await supabase.from('pontuacao_diaria')
      .select('*').eq('usuario_id', userId).eq('data', hoje).single()

    if (data) {
      await supabase.from('pontuacao_diaria').update({
        pontos_total: Math.min(100, data.pontos_total + pontos),
        reunioes: data.reunioes + 1,
        atualizado_em: new Date().toISOString(),
      }).eq('id', data.id)
    } else {
      await supabase.from('pontuacao_diaria').insert({
        usuario_id: userId,
        data: hoje,
        pontos_total: Math.min(100, pontos),
        reunioes: 1,
      })
    }

    // Atualizar streak
    await atualizarStreak(userId, hoje)
  }

  async function atualizarStreak(userId: string, hoje: string) {
    const { data } = await supabase.from('streaks').select('*').eq('usuario_id', userId).single()
    if (!data) return

    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    const ontemStr = ontem.toISOString().split('T')[0]

    const novoStreak = data.ultimo_dia_ativo === ontemStr || data.ultimo_dia_ativo === hoje
      ? (data.ultimo_dia_ativo === hoje ? data.streak_atual : data.streak_atual + 1)
      : 1

    await supabase.from('streaks').update({
      streak_atual: novoStreak,
      streak_maximo: Math.max(novoStreak, data.streak_maximo),
      ultimo_dia_ativo: hoje,
      atualizado_em: new Date().toISOString(),
    }).eq('usuario_id', userId)
  }

  if (etapa === 'sucesso') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Check-in registrado!</h2>
          <p className="text-sm" style={{ color: 'rgba(241,245,249,0.5)' }}>
            {tipoSelecionado?.nome}
          </p>
        </div>
        <div className="card-rad-glow text-center px-8 py-6">
          <div className="text-4xl font-black mb-1" style={{ color: '#00c3ff' }}>
            +{pontosGanhos}
          </div>
          <div className="text-sm" style={{ color: 'rgba(241,245,249,0.5)' }}>
            pontos ganhos hoje
            {pontosGanhos > tipoSelecionado!.pontos && (
              <div className="text-xs mt-1" style={{ color: '#fbbf24' }}>
                🔥 +20 bônus por ter ido mesmo sem querer!
              </div>
            )}
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')} className="btn-rad" style={{ maxWidth: '280px' }}>
          Voltar para o início
        </button>
      </div>
    )
  }

  if (etapa === 'notas') {
    return (
      <div className="space-y-6">
        <div>
          <button onClick={() => setEtapa('tipo')}
            className="text-sm mb-4 flex items-center gap-1"
            style={{ color: 'rgba(241,245,249,0.4)' }}>
            ← Voltar
          </button>
          <h1 className="text-2xl font-black text-white">Como foi a reunião?</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(241,245,249,0.5)' }}>
            {tipoSelecionado?.nome}
          </p>
        </div>

        <div className="card-rad space-y-6">
          <div>
            <label className="label-rad mb-3 block">
              O quanto você queria estar lá?
            </label>
            <NotaSlider valor={notaQuerer} onChange={setNotaQuerer}
              labelBaixo="Não queria" labelAlto="Queria muito" />
            {notaQuerer < 5 && (
              <div className="mt-2 text-xs rounded-lg px-3 py-2"
                   style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                🔥 Bônus de +20 pts por ter ido mesmo sem querer!
              </div>
            )}
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div>
            <label className="label-rad mb-3 block">
              O quanto a reunião fez bem para você?
            </label>
            <NotaSlider valor={notaBeneficio} onChange={setNotaBeneficio}
              labelBaixo="Não ajudou" labelAlto="Ajudou muito" />
          </div>
        </div>

        <div className="card-rad">
          <label className="label-rad">Observações (opcional)</label>
          <textarea
            className="input-rad mt-1"
            rows={3}
            placeholder="O que aconteceu de marcante nessa reunião?"
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <button onClick={handleRegistrar} disabled={loading} className="btn-rad">
          {loading ? 'Registrando...' : `Registrar check-in (+${tipoSelecionado!.pontos + (notaQuerer < 5 ? 20 : 0)} pts)`}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Fui à reunião! 🤝</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(241,245,249,0.5)' }}>
          Que tipo de reunião foi?
        </p>
      </div>

      <div className="space-y-3">
        {tipos.map(tipo => {
          const Icon = ICONES[tipo.icone] || Circle
          const selecionado = tipoSelecionado?.id === tipo.id
          return (
            <button key={tipo.id}
              onClick={() => setTipoSelecionado(tipo)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                background: selecionado
                  ? 'linear-gradient(135deg, rgba(4,69,222,0.3), rgba(0,195,255,0.15))'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selecionado ? 'rgba(0,195,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: selecionado ? 'rgba(0,195,255,0.2)' : 'rgba(255,255,255,0.05)' }}>
                <Icon size={20} color={selecionado ? '#00c3ff' : 'rgba(241,245,249,0.4)'} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-white">{tipo.nome}</div>
              </div>
              <div className="text-xs font-bold" style={{ color: '#00c3ff' }}>+{tipo.pontos}</div>
              {selecionado && <CheckCircle size={18} color="#00c3ff" />}
            </button>
          )
        })}
      </div>

      {tipoSelecionado && (
        <button onClick={() => setEtapa('notas')} className="btn-rad">
          Continuar →
        </button>
      )}
    </div>
  )
}

function NotaSlider({ valor, onChange, labelBaixo, labelAlto }: {
  valor: number; onChange: (v: number) => void
  labelBaixo: string; labelAlto: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(241,245,249,0.4)' }}>
        <span>{labelBaixo}</span>
        <span className="font-bold text-white text-sm">{valor}/10</span>
        <span>{labelAlto}</span>
      </div>
      <input type="range" min={0} max={10} value={valor}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full" style={{ accentColor: '#00c3ff', height: '6px' }} />
      <div className="flex justify-between mt-1">
        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} className="text-xs" style={{
            color: n === valor ? '#00c3ff' : 'rgba(241,245,249,0.2)',
            fontWeight: n === valor ? 700 : 400,
          }}>{n}</span>
        ))}
      </div>
    </div>
  )
}
