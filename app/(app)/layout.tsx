import BottomNav from '@/components/app/BottomNav'
import InstallPrompt from '@/components/app/InstallPrompt'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <main className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
