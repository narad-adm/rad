'use server'
import { createClient } from '@/lib/supabase/server'

export async function concluirOnboarding(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('perfis').update({ onboarding_concluido: true }).eq('id', user.id)
}
