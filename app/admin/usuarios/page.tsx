import { getResumoUsuarios } from '@/lib/admin/queries'
import UsuariosTabela from '@/components/admin/UsuariosTabela'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const usuarios = await getResumoUsuarios()

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-black md:text-3xl" style={{ color: 'var(--text-1)' }}>
          Usuários
        </h1>
        <p className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>
          {usuarios.length} {usuarios.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
        </p>
      </header>

      <UsuariosTabela usuarios={usuarios} />
    </div>
  )
}
