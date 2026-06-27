'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeSlash, ArrowLeft } from '@phosphor-icons/react'

export default function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [dataLimpeza, setDataLimpeza] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const supabase = createClient()

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setErro(error.message.includes('already registered')
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    if (data.user) {
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, nome, dataLimpeza }),
      })

      if (!res.ok) {
        const json = await res.json()
        setErro(json.error ?? 'Erro ao salvar perfil. Tente novamente.')
        setLoading(false)
        return
      }

      window.location.href = '/dashboard'
    }
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
    }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: 'var(--duo-blue)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: '0.375rem',
        }}>
          RAD
        </h1>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Recuperação Ativa Diária
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-card)',
        border: '2px solid var(--border)',
        borderRadius: 24,
        padding: '1.75rem 1.5rem',
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-1)', marginBottom: '0.25rem' }}>
          Criar conta
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
          Começe a sua jornada de recuperação ativa diária
        </p>

        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Seu nome</label>
            <input
              type="text"
              className="input-field"
              placeholder="Como você quer ser chamado"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showSenha ? 'text' : 'password'}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showSenha ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Início da recuperação</label>
            <input
              type="date"
              className="input-field"
              value={dataLimpeza}
              onChange={e => setDataLimpeza(e.target.value)}
              required
              max={hoje}
              style={{ colorScheme: 'dark' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.375rem', fontWeight: 600 }}>
              O dia em que você ficou limpo(a)
            </p>
          </div>

          {erro && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              border: '1.5px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '0.25rem' }}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          margin: '1.25rem 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} weight="bold" />
            Já tenho conta
          </button>
        </Link>
      </div>

      <p style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: '2rem', fontWeight: 600, letterSpacing: '0.04em' }}>
        Narcóticos Anônimos • Só por hoje
      </p>
    </div>
  )
}
