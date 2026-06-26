'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Waves } from 'lucide-react'

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
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
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

      // Criar streak inicial
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
         style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1530 100%)' }}>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #0445de, #00c3ff)', boxShadow: '0 8px 32px rgba(4,69,222,0.4)' }}>
          <Waves size={28} color="white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Criar conta no RAD</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(241,245,249,0.5)' }}>
          Comece sua jornada de recuperação ativa
        </p>
      </div>

      <div className="w-full max-w-sm card-rad">
        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="label-rad">Seu nome</label>
            <input
              type="text"
              className="input-rad"
              placeholder="Como você quer ser chamado"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>

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
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
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

          <div>
            <label className="label-rad">Data de limpeza</label>
            <input
              type="date"
              className="input-rad"
              value={dataLimpeza}
              onChange={e => setDataLimpeza(e.target.value)}
              required
              max={hoje}
              style={{ colorScheme: 'dark' }}
            />
            <p className="text-xs mt-1" style={{ color: 'rgba(241,245,249,0.3)' }}>
              O dia em que você ficou limpo(a)
            </p>
          </div>

          {erro && (
            <div className="text-sm rounded-xl px-4 py-3"
                 style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-rad mt-2">
            {loading ? 'Criando conta...' : 'Começar minha recuperação'}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: 'rgba(241,245,249,0.4)' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#00c3ff', fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
