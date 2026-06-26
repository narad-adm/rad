'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('rad-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('rad-theme', 'light')
    }
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Alternar tema">
      {mounted
        ? dark
          ? <Sun size={18} weight="bold" />
          : <Moon size={18} weight="bold" />
        : <span style={{ width: 18, height: 18, display: 'block' }} />
      }
    </button>
  )
}
