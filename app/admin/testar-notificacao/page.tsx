import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TestarNotificacaoClient from './TestarNotificacaoClient'

const ADMIN_EMAIL = 'sperancin.ads@gmail.com'

export default async function TestarNotificacaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/login')

  const { data: usuarios } = await supabase
    .from('perfis')
    .select('id, nome')
    .order('nome')

  return <TestarNotificacaoClient usuarios={usuarios ?? []} />
}
