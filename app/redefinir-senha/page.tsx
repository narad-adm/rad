'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LockKey, CheckCircle } from '@phosphor-icons/react'

type Etapa = 'aguardando' | 'formulario' | 'sucesso' | 'erro'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const supabase = createClient()

  const [etapa, setEtapa] = useState<Etapa>('aguardando')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    // Supabase lê o access_token do hash da URL e dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setEtapa('formulario')
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (senha.length < 6) {
      setErrMsg('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErrMsg('As senhas não coincidem.')
      return
    }
    setSalvando(true)
    setErrMsg('')
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) {
      setErrMsg(error.message)
      setSalvando(false)
    } else {
      setEtapa('sucesso')
      setTimeout(() => router.push('/login'), 2500)
    }
  }

  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      padding: '1.5rem',
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>

        {/* Aguardando token */}
        {etapa === 'aguardando' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div className="spin-indicator" style={{ margin: '0 auto 1rem' }} />
            <p className="font-bold" style={{ color: 'var(--text-2)' }}>
              Verificando link de redefinição...
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
              Se demorar muito, o link pode ter expirado. Solicite um novo ao administrador.
            </p>
          </div>
        )}

        {/* Formulário de nova senha */}
        {etapa === 'formulario' && (
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <LockKey size={24} weight="fill" color="var(--duo-blue)" />
              <h1 className="text-xl font-black" style={{ color: 'var(--text-1)' }}>
                Nova senha
              </h1>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
              Escolha uma senha segura para sua conta.
            </p>

            <div>
              <label className="label">Nova senha</label>
              <input
                type="password"
                className="input-field"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="label">Confirmar senha</label>
              <input
                type="password"
                className="input-field"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repita a senha"
                required
              />
            </div>

            {errMsg && (
              <p className="text-sm font-bold" style={{ color: '#ef4444' }}>{errMsg}</p>
            )}

            <button type="submit" disabled={salvando} className="btn-primary">
              {salvando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {/* Sucesso */}
        {etapa === 'sucesso' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={48} weight="fill" color="var(--duo-green)" style={{ margin: '0 auto 1rem' }} />
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-1)' }}>
              Senha alterada!
            </h2>
            <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
              Redirecionando para o login...
            </p>
          </div>
        )}

        {/* Erro */}
        {etapa === 'erro' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p className="text-lg font-black mb-2" style={{ color: '#ef4444' }}>
              Link inválido ou expirado
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
              Solicite ao administrador que gere um novo link.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
