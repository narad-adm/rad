'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, ShieldCheck, ShieldSlash, CheckCircle, XCircle } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function RankingOptIn({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'aceitar' | 'recusar' | null>(null)

  async function responder(valor: boolean) {
    setLoading(valor ? 'aceitar' : 'recusar')
    const supabase = createClient()
    await supabase
      .from('perfis')
      .update({ ranking_opt_in: valor, ranking_opt_in_em: new Date().toISOString() })
      .eq('id', userId)
    router.refresh()
  }

  return (
    <main style={{ padding: '1.5rem 1rem 6rem', maxWidth: 380, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>

        {/* Hero icon */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'var(--accent-grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,157,255,0.35)',
        }}>
          <Trophy size={48} weight="duotone" color="white" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-1)', margin: 0 }}>
            Ranking da Comunidade
          </h1>
          <p style={{ color: 'var(--text-2)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Compare sua semana com outros membros da comunidade de forma anônima e segura.
          </p>
        </div>

        {/* O que é compartilhado */}
        <div className="card" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={16} weight="bold" color="var(--success)" />
            <span style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '0.875rem' }}>Compartilhado</span>
          </div>
          {[
            'Seu nome de cadastro',
            'Seus pontos desta semana',
            'Sua sequência de dias (streak)',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={16} weight="bold" color="var(--success)" />
              <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{item}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', margin: '0.75rem 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldSlash size={16} weight="bold" color="#ef4444" />
            <span style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '0.875rem' }}>Nunca visível</span>
          </div>
          {[
            'Suas respostas e reflexões',
            'Seus inventários do 10° Passo',
            'Seu tempo de limpeza e dados pessoais',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <XCircle size={16} weight="bold" color="#ef4444" />
              <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{item}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontStyle: 'italic', textAlign: 'center' }}>
          Você pode sair do ranking a qualquer momento.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <button
            className="btn-primary"
            onClick={() => responder(true)}
            disabled={loading !== null}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Trophy size={18} weight="bold" />
            {loading === 'aceitar' ? 'Entrando...' : 'Participar do ranking'}
          </button>
          <button
            className="btn-outline"
            onClick={() => responder(false)}
            disabled={loading !== null}
          >
            {loading === 'recusar' ? 'Salvando...' : 'Prefiro não participar agora'}
          </button>
        </div>

      </div>
    </main>
  )
}
