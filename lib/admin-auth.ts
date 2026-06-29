import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * E-mail do único usuário com acesso ao painel de administrador.
 * Pode ser sobrescrito por ADMIN_EMAIL no ambiente.
 */
export const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ?? 'sperancin.ads@gmail.com'
).toLowerCase()

/**
 * Garante que o usuário autenticado é o admin. Caso contrário,
 * redireciona — usuários comuns nunca recebem HTML do painel.
 * Retorna o usuário autenticado para uso na página.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) redirect('/dashboard')

  return user
}

/** Verificação booleana (para rotas de API). */
export async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email?.toLowerCase() === ADMIN_EMAIL ? user : null
}
