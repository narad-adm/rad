import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = { title: 'RAD Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <AdminShell>{children}</AdminShell>
}
