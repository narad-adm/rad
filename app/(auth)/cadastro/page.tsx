'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeSlash, Waves } from '@phosphor-icons/react'

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
      const { error: perfilError } = await supabase.from('perfis').insert({
        id: data.user.id,
        nome: nome.trim(),
        data_limpeza: dataLimpeza,
      })

      if (perfilError) {
        setErro('Erro ao salvar perfil. Tente novamente.')
        setLoading(false)
        return
      }

      await supabase.from('streaks').insert({
        usuario_id: data.user.id,
        streak_atual: 0,
        streak_maximo: 0,
      })

      window.location.href = '/dashboard'
    }
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'var(--bg)' }}>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
             style={{ background: 'var(--accent-grad)', boxShadow: '0 8px 32px rgba(0,157,255,0.35)' }}>
          <Waves size={28} weight="duotone" color="white" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-1)' }}>Criar conta no RAD</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>
          Comece sua jornada de recuperação ativa
        </p>
      </div>

      <div className="card w-full" style={{ maxWidth: 400 }}>
        <form onSubmit={handleCadastro} className="space-y-4">
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
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showSenha ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Data de limpeza</label>
            <input
              type="date"
              className="input-field"
              value={dataLimpeza}
              onChange={e => setDataLimpeza(e.target.value)}
              required
              max={hoje}
              style={{ colorScheme: 'dark' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>
              O dia em que você ficou limpo(a)
            </p>
          </div>

          {erro && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.875rem',
            }}>
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Criando conta...' : 'Começar minha recuperação'}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-3)' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 800, textDecoration: 'none' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
