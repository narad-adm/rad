'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Waves } from 'lucide-react'

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
    const { error } = await supabase.auth.signInWithPassword({
      email, password: senha
    })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1530 100%)' }}>

      {/* Logo */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #0445de, #00c3ff)', boxShadow: '0 8px 32px rgba(4,69,222,0.4)' }}>
          <Waves size={36} color="white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">RAD</h1>
        <p className="text-sm" style={{ color: 'rgba(241,245,249,0.5)' }}>
          Recuperação Ativa Diária
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card-rad">
        <h2 className="text-xl font-bold text-white mb-6">Entrar</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label-rad">E-mail</label>
            <input
              type="email"
              className="input-rad"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label-rad">Senha</label>
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                className="input-rad"
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
                style={{ color: 'rgba(241,245,249,0.4)' }}>
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro && (
            <div className="text-sm rounded-xl px-4 py-3"
                 style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-rad mt-2">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(241,245,249,0.4)' }}>
          Ainda não tem conta?{' '}
          <Link href="/cadastro" style={{ color: '#00c3ff', fontWeight: 600 }}>
            Cadastre-se
          </Link>
        </p>
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'rgba(241,245,249,0.2)' }}>
        Narcóticos Anônimos • Só por hoje
      </p>
    </div>
  )
}
