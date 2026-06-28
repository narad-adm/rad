import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilClient from '@/components/app/PerfilClient'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [perfilData, subData] = await Promise.all([
    supabase.from('perfis').select('nome, data_limpeza, ranking_opt_in, criado_em').eq('id', user.id).single(),
    supabase.from('push_subscriptions').select('id').eq('usuario_id', user.id).limit(1),
  ])

  if (!perfilData.data) redirect('/login')

  return (
    <PerfilClient
      perfil={perfilData.data}
      temNotificacao={!!(subData.data && subData.data.length > 0)}
      userId={user.id}
      email={user.email ?? ''}
    />
  )
}
