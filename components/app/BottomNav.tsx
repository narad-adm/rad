'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, BookOpen, ClipboardList, BarChart2 } from 'lucide-react'

const items = [
  { href: '/dashboard',     label: 'Início',    icon: LayoutDashboard },
  { href: '/reuniao',       label: 'Reunião',   icon: CalendarCheck   },
  { href: '/sohoje',        label: 'Só Hoje',   icon: BookOpen        },
  { href: '/decimo-passo',  label: '10° Passo', icon: ClipboardList   },
  { href: '/relatorios',    label: 'Histórico', icon: BarChart2       },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
         style={{
           background: 'rgba(10,14,26,0.95)',
           backdropFilter: 'blur(20px)',
           borderTop: '1px solid rgba(100,190,217,0.1)',
           paddingBottom: 'env(safe-area-inset-bottom, 8px)',
         }}>
      <div className="flex items-center max-w-lg mx-auto px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
