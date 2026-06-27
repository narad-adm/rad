import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const inicioMesAtual = new Date()
  inicioMesAtual.setDate(1)
  const dataCorte = inicioMesAtual.toISOString().split('T')[0]

  const { count } = await admin
    .from('humores_diarios')
    .delete({ count: 'exact' })
    .lt('data', dataCorte)

  return NextResponse.json({
    deletados: count,
    mensagem: `Humores anteriores a ${dataCorte} removidos`,
  })
}
