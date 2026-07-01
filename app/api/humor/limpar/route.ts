import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    mensagem: 'Limpeza de humores desativada — todos os registros são mantidos.',
  })
}
