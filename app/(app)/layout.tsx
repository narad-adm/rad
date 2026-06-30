import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/app/BottomNav'
import InstallPrompt from '@/components/app/InstallPrompt'
import RegistrarAcesso from '@/components/app/RegistrarAcesso'
import BannerGlobal from '@/components/app/BannerGlobal'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ data: { user } }, { data: banner }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('banners_globais')
      .select('mensagem, tipo')
      .eq('ativo', true)
      .limit(1)
      .maybeSingle(),
  ])

  // Verifica se a conta do usuário está desativada
  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('desativado')
      .eq('id', user.id)
      .single()

    if (perfil?.desativado) {
      await supabase.auth.signOut()
      redirect('/login')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {banner && <BannerGlobal mensagem={banner.mensagem} tipo={banner.tipo} />}
      <main className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
      <RegistrarAcesso />
    </div>
  )
}
