import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SoHojeClient from '@/components/app/SoHojeClient'
import { hojeEmBRT } from '@/lib/utils'

export default async function SoHojePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hojeStr = hojeEmBRT()
  const [, mesStr, diaStr] = hojeStr.split('-')
  const mes = parseInt(mesStr, 10)
  const dia = parseInt(diaStr, 10)

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
      .eq('data', hojeStr)
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
