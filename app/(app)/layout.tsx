import BottomNav from '@/components/app/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1530 100%)' }}>
      <main className="pb-24 px-4 pt-6 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
