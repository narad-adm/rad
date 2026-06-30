import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Fire, CalendarBlank, CheckCircle, Circle,
  Users, BookOpen, NotePencil, Smiley,
} from '@phosphor-icons/react/dist/ssr'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcularDiasLimpo, calcularTempoLimpo, getNivelRecuperacao, PONTOS } from '@/lib/types'
import { hojeEmBRT } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function VisualizarUsuarioPage({ params }: { params: Params }) {
  await requireAdmin()
  const { id } = await params
  const supabase = createAdminClient()
  const hoje = hojeEmBRT()

  const [perfil, pontuacao, streak, checkins, leitura, inventario, humor] = await Promise.all([
    supabase.from('perfis').select('*').eq('id', id).single(),
    supabase.from('pontuacao_diaria').select('*').eq('usuario_id', id).eq('data', hoje).single(),
    supabase.from('streaks').select('*').eq('usuario_id', id).single(),
    supabase.from('checkins_reuniao').select('id').eq('usuario_id', id).eq('data', hoje),
    supabase.from('leituras_spj').select('id').eq('usuario_id', id).eq('data', hoje).single(),
    supabase.from('inventarios_diarios').select('id').eq('usuario_id', id).eq('data', hoje).single(),
    supabase.from('humores_diarios').select('humor').eq('usuario_id', id).eq('data', hoje).single(),
  ])

  if (!perfil.data) notFound()

  const p = perfil.data
  const diasLimpo = calcularDiasLimpo(p.data_limpeza)
  const { anos, meses, dias } = calcularTempoLimpo(p.data_limpeza)
  const pontuacaoHoje = pontuacao.data?.pontos_total ?? 0
  const streakAtual = streak.data?.streak_atual ?? 0
  const streakMax = streak.data?.streak_maximo ?? 0
  const porcentagem = Math.min(100, (pontuacaoHoje / PONTOS.MAXIMO_DIARIO) * 100)
  const nivel = getNivelRecuperacao(pontuacaoHoje)

  const tempoStr = [
    anos > 0  ? `${anos} ano${anos > 1 ? 's' : ''}`    : '',
    meses > 0 ? `${meses} mês${meses > 1 ? 'es' : ''}` : '',
    `${dias} dia${dias !== 1 ? 's' : ''}`,
  ].filter(Boolean).join(', ')

  const atividades = [
    { label: 'Reunião',      feito: (checkins.data?.length ?? 0) > 0, icon: Users      },
    { label: 'Leitura SPJ',  feito: !!leitura.data,                   icon: BookOpen   },
    { label: 'Inventário',   feito: !!inventario.data,                 icon: NotePencil },
    { label: 'Humor',        feito: !!humor.data,                      icon: Smiley     },
  ]

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/admin/usuarios/${id}`}
        className="flex items-center gap-1 text-sm font-extrabold"
        style={{ color: 'var(--text-3)' }}
      >
        <ArrowLeft size={16} weight="bold" /> {p.nome}
      </Link>

      {/* Aviso de modo visualização */}
      <div className="rounded-xl px-4 py-3" style={{
        background: 'color-mix(in srgb, var(--duo-orange) 12%, transparent)',
        border: '2px solid var(--duo-orange)',
      }}>
        <p className="text-sm font-bold" style={{ color: 'var(--duo-orange)' }}>
          Modo visualização — você está vendo o app como{' '}
          <strong>{p.nome}</strong> vê hoje. Nenhuma ação aqui afeta a conta do usuário.
        </p>
      </div>

      {/* Cabeçalho do usuário */}
      <div className="card">
        <p className="text-sm font-extrabold" style={{ color: 'var(--text-3)' }}>
          {diasLimpo} dias limpo
        </p>
        <h1 className="text-2xl font-black mt-0.5" style={{ color: 'var(--text-1)' }}>
          {p.nome.split(' ')[0]}
        </h1>
        <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-3)' }}>{tempoStr}</p>

        {/* Barra de pontuação */}
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-extrabold" style={{ color: 'var(--text-2)' }}>
              Pontuação de hoje
            </span>
            <span className="text-sm font-black" style={{ color: nivel.cor }}>
              {pontuacaoHoje}/{PONTOS.MAXIMO_DIARIO}
            </span>
          </div>
          <div style={{ height: 14, borderRadius: 8, background: 'var(--bg-card-2)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${porcentagem}%`,
              background: nivel.cor,
              borderRadius: 8,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p className="text-xs font-bold mt-1.5" style={{ color: nivel.cor }}>
            {nivel.nivel} — {nivel.mensagem}
          </p>
        </div>
      </div>

      {/* Streak e dias */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <Fire size={22} weight="fill" color="var(--duo-orange)" />
          <p className="mt-2 text-2xl font-black" style={{ color: 'var(--text-1)' }}>{streakAtual}</p>
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-3)' }}>Streak atual</p>
        </div>
        <div className="card">
          <Fire size={22} weight="fill" color="var(--duo-yellow, #fbbf24)" />
          <p className="mt-2 text-2xl font-black" style={{ color: 'var(--text-1)' }}>{streakMax}</p>
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-3)' }}>Recorde</p>
        </div>
        <div className="card">
          <CalendarBlank size={22} weight="fill" color="var(--duo-blue)" />
          <p className="mt-2 text-2xl font-black" style={{ color: 'var(--text-1)' }}>{diasLimpo}</p>
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-3)' }}>Dias limpo</p>
        </div>
      </div>

      {/* Atividades de hoje */}
      <section className="card">
        <h2 className="mb-3 text-lg font-black" style={{ color: 'var(--text-1)' }}>
          Atividades de hoje
        </h2>
        <ul className="flex flex-col gap-2">
          {atividades.map(a => (
            <li
              key={a.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg-card-2)' }}
            >
              {a.feito
                ? <CheckCircle size={22} weight="fill" color="var(--duo-green)" />
                : <Circle size={22} weight="regular" color="var(--text-3)" />
              }
              <span className="font-bold" style={{ color: a.feito ? 'var(--text-1)' : 'var(--text-3)' }}>
                {a.label}
              </span>
              <span className="ml-auto text-xs font-bold" style={{ color: a.feito ? 'var(--duo-green)' : 'var(--text-3)' }}>
                {a.feito ? 'Concluído' : 'Pendente'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
