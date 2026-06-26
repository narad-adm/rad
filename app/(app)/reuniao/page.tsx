'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, UsersFour, Rows, BookOpenText, CalendarDots, Books, Star, Circle, Confetti, Fire, Handshake,
} from '@phosphor-icons/react'
import type { TipoReuniao } from '@/lib/types'

const ICONES: Record<string, React.ComponentType<any>> = {
  Users: UsersFour,
  Layers: Rows,
  BookOpen: BookOpenText,
  CalendarDays: CalendarDots,
  Book: Books,
  Star: Star,
  Circle: Circle,
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
    const bonus = notaQuerer < 5 ? 20 : 0
    const pontos = tipoSelecionado.pontos + bonus

    const { error } = await supabase.from('checkins_reuniao').insert({
      usuario_id: user.id,
      tipo_reuniao_id: tipoSelecionado.id,
      data: hoje, hora,
      nota_querer: notaQuerer,
      nota_beneficio: notaBeneficio,
      observacao: observacao.trim() || null,
      pontos_ganhos: pontos,
    })

    if (!error) {
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
        usuario_id: userId, data: hoje,
        pontos_total: Math.min(100, pontos), reunioes: 1,
      })
    }

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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <Confetti size={64} weight="duotone" color="var(--duo-green)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Check-in registrado!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{tipoSelecionado?.nome}</p>
        </div>
        <div className="card pop-in text-center" style={{ padding: '2rem 3rem' }}>
          <div style={{
            fontSize: '3rem', fontWeight: 900, lineHeight: 1,
            background: 'var(--accent-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            +{pontosGanhos}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.5rem' }}>
            pontos ganhos hoje
          </div>
          {pontosGanhos > tipoSelecionado!.pontos && (
            <div className="badge badge-yellow" style={{ marginTop: '0.75rem' }}>
              +20 bônus por ter ido mesmo sem querer!
            </div>
          )}
        </div>
        <button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ maxWidth: 280 }}>
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
            style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            ← Voltar
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>Como foi a reunião?</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>
            {tipoSelecionado?.nome}
          </p>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="label" style={{ marginBottom: '0.75rem', display: 'block' }}>
              O quanto você queria estar lá?
            </label>
            <NotaSlider valor={notaQuerer} onChange={setNotaQuerer}
              labelBaixo="Não queria" labelAlto="Queria muito" />
            {notaQuerer < 5 && (
              <div className="mt-2 badge badge-yellow" style={{ display: 'inline-flex', padding: '0.5rem 0.75rem' }}>
                Bônus de +20 pts por ter ido mesmo sem querer!
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          <div>
            <label className="label" style={{ marginBottom: '0.75rem', display: 'block' }}>
              O quanto a reunião fez bem para você?
            </label>
            <NotaSlider valor={notaBeneficio} onChange={setNotaBeneficio}
              labelBaixo="Não ajudou" labelAlto="Ajudou muito" />
          </div>
        </div>

        <div className="card">
          <label className="label">Observações (opcional)</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="O que aconteceu de marcante nessa reunião?"
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            style={{ resize: 'none', marginTop: '0.25rem' }}
          />
        </div>

        <button onClick={handleRegistrar} disabled={loading} className="btn-primary">
          {loading ? 'Registrando...' : `Registrar check-in (+${tipoSelecionado!.pontos + (notaQuerer < 5 ? 20 : 0)} pts)`}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          Fui à reunião!
          <Handshake size={26} weight="duotone" color="var(--duo-blue)" />
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>
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
                background: selecionado ? 'rgba(0,157,255,0.08)' : 'var(--bg-card)',
                border: `2px solid ${selecionado ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: selecionado ? 'rgba(0,157,255,0.15)' : 'var(--bg-card-2)',
                color: selecionado ? 'var(--accent)' : 'var(--text-3)',
              }}>
                <Icon size={20} weight="bold" />
              </div>
              <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
                {tipo.nome}
              </div>
              <div>
                <span className="badge badge-blue">+{tipo.pontos}</span>
              </div>
              {selecionado && <CheckCircle size={18} weight="bold" color="#009dff" />}
            </button>
          )
        })}
      </div>

      {tipoSelecionado && (
        <button onClick={() => setEtapa('notas')} className="btn-primary">
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
      <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-3)' }}>
        <span>{labelBaixo}</span>
        <span style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '0.875rem' }}>{valor}/10</span>
        <span>{labelAlto}</span>
      </div>
      <input type="range" min={0} max={10} value={valor}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full" style={{ accentColor: 'var(--accent)', height: '6px' }} />
      <div className="flex justify-between mt-1">
        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{
            fontSize: '0.65rem',
            color: n === valor ? 'var(--accent)' : 'var(--text-3)',
            fontWeight: n === valor ? 800 : 600,
          }}>{n}</span>
        ))}
      </div>
    </div>
  )
}
