import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = Promise<{ id: string }>

export async function POST(_req: NextRequest, { params }: { params: Params }) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const supabase = createAdminClient()

  const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(id)
  if (userErr || !user?.email) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: user.email,
  })
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao gerar link' }, { status: 500 })
  }

  return NextResponse.json({
    link: data.properties.action_link,
    email: user.email,
  })
}
