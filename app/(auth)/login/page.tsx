'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeSlash } from '@phosphor-icons/react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'var(--bg)' }}>

      {/* Logo */}
      <div className="text-center mb-10">
        <Image
          src="/icons/na_blue_book_final_512.png"
          alt="RAD"
          width={80}
          height={80}
          style={{ borderRadius: 20, margin: '0 auto 1rem' }}
        />
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-1)' }}>RAD</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>
          Recuperação Ativa Diária
        </p>
      </div>

      {/* Card */}
      <div className="card w-full" style={{ maxWidth: 400 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '1.5rem' }}>
          Entrar
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-3)' }}>
          Ainda não tem conta?{' '}
          <Link href="/cadastro" style={{ color: 'var(--accent)', fontWeight: 800, textDecoration: 'none' }}>
            Cadastre-se
          </Link>
        </p>
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-3)' }}>
        Narcóticos Anônimos • Só por hoje
      </p>
    </div>
  )
}
