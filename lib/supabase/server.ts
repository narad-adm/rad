import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = 'https://fbavtjkucwbqvjdjcgti.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYXZ0amt1Y3dicXZqZGpjZ3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Nzk5OTUsImV4cCI6MjA5ODA1NTk5NX0.1-9rySG_vo49L4gYd4TQQZT3JWkC-WvsPL6RAtJL7xU'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYXZ0amt1Y3dicXZqZGpjZ3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ3OTk5NSwiZXhwIjoyMDk4MDU1OTk1fQ.jWrQ_V6fWeDtIWc11q-rHWfgT6P2dn6JBCXJVHdlD-4'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export async function createAdminClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
