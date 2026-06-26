'use client'
import { BarChart2, Flame, Trophy, Users, BookOpen, MessageSquare, ClipboardList } from 'lucide-react'

interface Props {
  diasLimpo: number
  streak: number
  streakMax: number
  pontuacoes: any[]
  checkins: any[]
  totalLeituras: number
  totalRespostas: number
  totalInventarios: number
}

export default function RelatoriosClient({
  diasLimpo, streak, streakMax, pontuacoes, checkins,
  totalLeituras, totalRespostas, totalInventarios
}: Props) {
  const totalPontos = pontuacoes.reduce((acc, p) => acc + p.pontos_total, 0)
  const totalReunioes = checkins.length
  const mediaPontos = pontuacoes.length > 0
    ? Math.round(totalPontos / pontuacoes.length)
    : 0

  // Últimos 7 dias para o gráfico
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const str = d.toISOString().split('T')[0]
    const pont = pontuacoes.find(p => p.data === str)
    return {
      dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
      pontos: pont?.pontos_total ?? 0,
      data: str,
    }
  })

  const maxPontos = Math.max(...ultimos7.map(d => d.pontos), 1)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(241,245,249,0.4)' }}>
          MEU PROGRESSO
        </p>
        <h1 className="text-2xl font-black text-white">Histórico</h1>
      </div>

      {/* Card principal */}
      <div className="card-rad-glow text-center py-6">
        <div className="text-5xl font-black mb-1" style={{ color: '#00c3ff' }}>
          {diasLimpo.toLocaleString('pt-BR')}
        </div>
        <div className="text-sm" style={{ color: 'rgba(241,245,249,0.5)' }}>
          dias limpo(a) 💙
        </div>
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-rad text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-black" style={{ color: '#ff6b35' }}>{streak}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>sequência atual</div>
        </div>
        <div className="card-rad text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-2xl font-black text-white">{streakMax}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(241,245,249,0.5)' }}>recorde pessoal</div>
        </div>
      </div>

      {/* Gráfico dos últimos 7 dias */}
      <div className="card-rad">
        <p className="text-xs font-semibold mb-4" style={{ color: 'rgba(241,245,249,0.5)' }}>
          ÚLTIMOS 7 DIAS
        </p>
        <div className="flex items-end justify-between gap-2" style={{ height: '100px' }}>
          {ultimos7.map(({ dia, pontos, data }) => {
            const hoje = new Date().toISOString().split('T')[0]
            const isHoje = data === hoje
            const altura = pontos > 0 ? Math.max(8, (pontos / maxPontos) * 100) : 4
            return (
              <div key={data} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-xs font-bold" style={{ color: pontos >= 70 ? '#00c3ff' : 'rgba(241,245,249,0.3)' }}>
                  {pontos > 0 ? pontos : ''}
                </div>
                <div className="w-full rounded-t-lg transition-all"
                     style={{
                       height: `${altura}%`,
                       background: isHoje
                         ? 'linear-gradient(180deg, #00c3ff, #0445de)'
                         : pontos >= 70
                         ? 'linear-gradient(180deg, #67bed9, #0445de)'
                         : pontos >= 40
                         ? 'rgba(103,190,217,0.3)'
                         : 'rgba(255,255,255,0.06)',
                     }} />
                <div className="text-xs capitalize" style={{
                  color: isHoje ? '#00c3ff' : 'rgba(241,245,249,0.3)',
                  fontWeight: isHoje ? 700 : 400,
                }}>
                  {dia}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: 'rgba(241,245,249,0.3)' }}>
            Média: {mediaPontos} pts/dia
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1" style={{ color: '#00c3ff' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#00c3ff' }} />
              Hoje
            </span>
            <span className="flex items-center gap-1" style={{ color: 'rgba(241,245,249,0.3)' }}>
              ≥70 = excelente
            </span>
          </div>
        </div>
      </div>

      {/* Totais de atividades */}
      <div className="card-rad">
        <p className="text-xs font-semibold mb-4" style={{ color: 'rgba(241,245,249,0.5)' }}>
          TOTAL DE ATIVIDADES
        </p>
        <div className="space-y-3">
          <StatRow icon={<Users size={16} color="#00c3ff" />} label="Reuniões registradas" valor={totalReunioes} cor="#00c3ff" />
          <StatRow icon={<BookOpen size={16} color="#67bed9" />} label="Leituras do Só por Hoje" valor={totalLeituras} cor="#67bed9" />
          <StatRow icon={<ClipboardList size={16} color="#a78bfa" />} label="Inventários (10° Passo)" valor={totalInventarios} cor="#a78bfa" />
          <StatRow icon={<MessageSquare size={16} color="#34d399" />} label="Respostas do guia" valor={totalRespostas} cor="#34d399" />
        </div>
      </div>

      {/* Últimas reuniões */}
      {checkins.length > 0 && (
        <div className="card-rad">
          <p className="text-xs font-semibold mb-4" style={{ color: 'rgba(241,245,249,0.5)' }}>
            ÚLTIMAS REUNIÕES
          </p>
          <div className="space-y-3">
            {checkins.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">
                    {c.tipos_reuniao?.nome ?? 'Reunião'}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(241,245,249,0.4)' }}>
                    {new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short'
                    })}
                    {c.nota_beneficio != null && ` · benefício: ${c.nota_beneficio}/10`}
                  </div>
                </div>
                <span className="badge-cyan">+{c.pontos_ganhos}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({ icon, label, valor, cor }: {
  icon: React.ReactNode; label: string; valor: number; cor: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
             style={{ background: `${cor}18` }}>
          {icon}
        </div>
        <span className="text-sm" style={{ color: 'rgba(241,245,249,0.7)' }}>{label}</span>
      </div>
      <span className="font-bold text-white">{valor}</span>
    </div>
  )
}
