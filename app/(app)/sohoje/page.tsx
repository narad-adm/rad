import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SoHojeClient from '@/components/app/SoHojeClient'

export default async function SoHojePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date()
  const mes = hoje.getMonth() + 1
  const dia = hoje.getDate()

  const [textoData, leituraData] = await Promise.all([
    supabase
      .from('so_por_hoje')
      .select('id, mes, dia, titulo, citacao, texto, reflexao, afirmacao')
      .eq('mes', mes)
      .eq('dia', dia)
      .single(),
    supabase
      .from('leituras_spj')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('data', hoje.toISOString().split('T')[0])
      .single(),
  ])

  return (
    <SoHojeClient
      texto={textoData.data}
      jaLeu={!!leituraData.data}
      userId={user.id}
      mes={mes}
      dia={dia}
    />
  )
}
