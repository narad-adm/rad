'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Info } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function RankingRecusado({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function participar() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('perfis')
      .update({ ranking_opt_in: true, ranking_opt_in_em: new Date().toISOString() })
      .eq('id', userId)
    router.refresh()
  }

  return (
    <main style={{ padding: '3rem 1rem 6rem', maxWidth: 380, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>

        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--bg-card-2)',
          border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={40} weight="duotone" color="var(--text-3)" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-1)', margin: 0 }}>
            Você não está no ranking
          </h2>
          <p style={{ color: 'var(--text-2)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Tudo bem! Sua recuperação não precisa ser comparada com ninguém. Continue no seu ritmo.
          </p>
        </div>

        <div className="card" style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <Info size={18} weight="bold" color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Se mudar de ideia, você pode participar a qualquer momento.
          </span>
        </div>

        <button
          className="btn-outline"
          onClick={participar}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
        >
          <Trophy size={18} weight="bold" />
          {loading ? 'Entrando...' : 'Quero participar do ranking'}
        </button>

      </div>
    </main>
  )
}
