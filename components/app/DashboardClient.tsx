'use client'
import Link from 'next/link'
import { CalendarCheck, BookOpen, ClipboardList, MessageSquare, LogOut, Flame, Trophy, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MESES, DIAS_SEMANA } from '@/lib/types'

interface Props {
  nome: string
  diasLimpo: number
  dataLimpeza: string
  pontuacaoHoje: number
  porcentagem: number
  nivel: { nivel: string; cor: string; mensagem: string; emoji: string }
  streak: number
  streakMax: number
  reunioesHoje: number
  leuHoje: boolean
  inventarioHoje: boolean
}

export default function DashboardClient({
  nome, diasLimpo, pontuacaoHoje, porcentagem,
  nivel, streak, streakMax, reunioesHoje, leuHoje, inventarioHoje
}: Props) {
  const agora = new Date()
  const diaSemana = DIAS_SEMANA[agora.getDay()]
  const dia = agora.getDate()
  const mes = MESES[agora.getMonth()]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const saudacao = () => {
    const h = agora.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'rgba(241,245,249,0.5)' }}>
            {diaSemana}, {dia} de {mes}
          </p>
          <h1 className="text-xl font-bold text-white">
            {saudacao()}, {nome.split(' ')[0]}! 👋
          </h1>
        </div>
        <button onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(241,245,249,0.4)' }}>
          <LogOut size={16} />
        </button>
      </div>

      {/* Card de dias limpo */}
      <div className="card-rad-glow text-center py-6">
        <div className="text-5xl font-black mb-1" style={{ color: '#00c3ff' }}>
          {diasLimpo.toLocaleString('pt-BR')}
        </div>
        <div className="text-sm font-medium" style={{ color: 'rgba(241,245,249,0.6)' }}>
          {diasLimpo === 1 ? 'dia limpo' : 'dias limpo(a)'}
        </div>
        <div className="mt-3 text-xs font-medium px-3 py-1.5 rounded-full inline-block"
             style={{ background: 'rgba(0,195,255,0.1)', color: '#00c3ff' }}>
          💙 Só por hoje
        </div>
      </div>

      {/* Pontuação do dia */}
      <div className="card-rad">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>
              RECUPERAÇÃO HOJE
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{pontuacaoHoje}</span>
              <span className="text-sm" style={{ color: 'rgba(241,245,249,0.4)' }}>/100 pts</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl mb-0.5">{nivel.emoji}</div>
            <div className="text-xs font-bold" style={{ color: nivel.cor }}>
              {nivel.nivel}
            </div>
          </div>
        </div>

        <div className="pontos-bar mb-3">
          <div className="pontos-bar-fill" style={{ width: `${porcentagem}%` }} />
        </div>

        <p className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>
          {nivel.mensagem}
        </p>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-rad text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-black" style={{ color: '#ff6b35' }}>{streak}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>
            dias seguidos
          </div>
        </div>
        <div className="card-rad text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-2xl font-black text-white">{streakMax}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>
            recorde pessoal
          </div>
        </div>
      </div>

      {/* Status das atividades de hoje */}
      <div className="card-rad">
        <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(241,245,249,0.5)' }}>
          HOJE VOCÊ JÁ FEZ
        </p>
        <div className="space-y-2.5">
          <AtividadeStatus
            feito={reunioesHoje > 0}
            label={reunioesHoje > 0 ? `${reunioesHoje} reunião(ões) ✓` : 'Nenhuma reunião ainda'}
            icon="🤝"
          />
          <AtividadeStatus
            feito={leuHoje}
            label={leuHoje ? 'Só por hoje lido ✓' : 'Leitura pendente'}
            icon="📖"
          />
          <AtividadeStatus
            feito={inventarioHoje}
            label={inventarioHoje ? '10° Passo feito ✓' : '10° Passo pendente'}
            icon="📝"
          />
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(241,245,249,0.5)' }}>
          O QUE VOCÊ QUER FAZER AGORA?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/reuniao" className="activity-btn">
            <div className="activity-icon"
                 style={{ background: 'linear-gradient(135deg, rgba(4,69,222,0.4), rgba(0,195,255,0.2))' }}>
              <CalendarCheck size={24} color="#00c3ff" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Fui à reunião</div>
              <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>+30 pontos</div>
            </div>
          </Link>

          <Link href="/sohoje" className="activity-btn">
            <div className="activity-icon"
                 style={{ background: 'linear-gradient(135deg, rgba(103,190,217,0.3), rgba(0,195,255,0.15))' }}>
              <BookOpen size={24} color="#67bed9" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Só por hoje</div>
              <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>+20 pontos</div>
            </div>
          </Link>

          <Link href="/decimo-passo" className="activity-btn">
            <div className="activity-icon"
                 style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(167,139,250,0.15))' }}>
              <ClipboardList size={24} color="#a78bfa" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">10° Passo</div>
              <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>+25 pontos</div>
            </div>
          </Link>

          <Link href="/passos" className="activity-btn">
            <div className="activity-icon"
                 style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.15))' }}>
              <MessageSquare size={24} color="#34d399" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Guia dos passos</div>
              <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>+15 pts/resposta</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function AtividadeStatus({ feito, label, icon }: { feito: boolean; label: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-sm flex-1" style={{ color: feito ? '#f1f5f9' : 'rgba(241,245,249,0.4)' }}>
        {label}
      </span>
      {feito && <CheckCircle size={16} color="#34d399" />}
    </div>
  )
}
