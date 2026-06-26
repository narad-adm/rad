import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://fbavtjkucwbqvjdjcgti.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYXZ0amt1Y3dicXZqZGpjZ3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Nzk5OTUsImV4cCI6MjA5ODA1NTk5NX0.1-9rySG_vo49L4gYd4TQQZT3JWkC-WvsPL6RAtJL7xU'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
