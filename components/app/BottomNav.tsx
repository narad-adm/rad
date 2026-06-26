'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, CalendarCheck, BookOpenText, ClipboardText, ChartBar } from '@phosphor-icons/react'

const items = [
  { href: '/dashboard',    label: 'Início',    Icon: House          },
  { href: '/reuniao',      label: 'Reunião',   Icon: CalendarCheck  },
  { href: '/sohoje',       label: 'Só Hoje',   Icon: BookOpenText   },
  { href: '/decimo-passo', label: '10° Passo', Icon: ClipboardText  },
  { href: '/relatorios',   label: 'Histórico', Icon: ChartBar       },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
         style={{
           background: 'var(--bg-card)',
           backdropFilter: 'blur(20px)',
           borderTop: '2px solid var(--border)',
           paddingBottom: 'env(safe-area-inset-bottom, 8px)',
         }}>
      <div className="flex items-center max-w-lg mx-auto px-2 py-2">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={active ? 26 : 22} weight="bold" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
