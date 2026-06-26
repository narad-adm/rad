import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = 'https://fbavtjkucwbqvjdjcgti.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYXZ0amt1Y3dicXZqZGpjZ3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Nzk5OTUsImV4cCI6MjA5ODA1NTk5NX0.1-9rySG_vo49L4gYd4TQQZT3JWkC-WvsPL6RAtJL7xU'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const rotasProtegidas = ['/dashboard', '/reuniao', '/sohoje', '/passos', '/decimo-passo', '/relatorios']
  const rotasAuth = ['/login', '/cadastro']

  const precisaAuth = rotasProtegidas.some(r => pathname.startsWith(r))
  const eRotaAuth = rotasAuth.some(r => pathname.startsWith(r))

  if (precisaAuth && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (eRotaAuth && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/reuniao/:path*', '/sohoje/:path*',
            '/passos/:path*', '/decimo-passo/:path*', '/relatorios/:path*',
            '/login', '/cadastro'],
}
