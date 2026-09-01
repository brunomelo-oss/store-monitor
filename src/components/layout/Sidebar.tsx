'use client'

import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LanguageContext'
import { LayoutDashboard, Layers, Users, Settings } from 'lucide-react'
import type { LangCode } from '@/lib/i18n'

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()
  const { isDark, toggle } = useTheme()
  const { lang, setLang, t } = useLang()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const languages: { code: LangCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'ar', label: 'العربية' },
  ]

  const navItems = [
    { id: '/apps', label: t('nav.apps'), icon: Layers },
    { id: '/admin', label: t('nav.users'), icon: Users },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-48 z-30 sasi-sidebar flex flex-col">
      <div className="flex items-center justify-center h-16 shrink-0 border-b border-[var(--surface-glass-border)]">
        <div className="w-32 h-10 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url(${isDark ? '/assets/logo-white.png' : '/assets/logo-black.png'})` }} />
      </div>

      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
        <Link href="/" className={`sasi-nav-item ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={20} className="shrink-0 opacity-70" />
          <span className="font-semibold">{t('nav.dashboard')}</span>
        </Link>

        {navItems.map(item => {
          const Icon = item.icon
          return (
            <Link key={item.id} href={item.id} className={`sasi-nav-item ${isActive(item.id) ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {isAdmin && (
          <Link href="/admin/connections" className={`sasi-nav-item ${isActive('/admin/connections') ? 'active' : ''}`}>
            <Settings size={20} />
            <span>{t('nav.connections')}</span>
          </Link>
        )}
      </nav>

      <div className="relative shrink-0 p-2 border-t border-[var(--surface-glass-border)]">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`sasi-nav-item w-full ${pathname.startsWith('/admin') ? 'active' : ''}`}
          aria-label={t('nav.settings')}
        >
          <Settings size={20} />
          <span>{t('nav.settings')}</span>
        </button>
        {settingsOpen && (
          <div className="absolute bottom-full left-2 mb-2 w-56 bg-card border border-border rounded-xl shadow-xl p-3 z-50 animate-dropdownIn origin-bottom">
            <div className="text-xs text-muted-foreground mb-2">{t('settings.theme')}</div>
            <div className="flex rounded-lg bg-inset p-0.5 relative">
              <div
                className="absolute h-[calc(100%-4px)] top-0.5 rounded-md bg-card shadow-sm transition-transform duration-200"
                style={{ width: '50%', transform: `translateX(${isDark ? '100%' : '0%'})` }}
              />
              <button onClick={() => { if (isDark) toggle(); setSettingsOpen(false) }} className="relative z-10 flex-1 h-8 text-xs font-medium rounded-md transition-colors">
                Light
              </button>
              <button onClick={() => { if (!isDark) toggle(); setSettingsOpen(false) }} className="relative z-10 flex-1 h-8 text-xs font-medium rounded-md transition-colors">
                Dark
              </button>
            </div>

            <div className="h-px bg-border my-3" />

            <div className="text-xs text-muted-foreground mb-2">{t('settings.language')}</div>
            <div className="flex rounded-lg bg-inset p-0.5 relative">
              <div
                className="absolute h-[calc(100%-4px)] top-0.5 rounded-md bg-card shadow-sm transition-transform duration-200"
                style={{ width: `${100 / languages.length}%`, transform: `translateX(${languages.findIndex(l => l.code === lang) * 100}%)` }}
              />
              {languages.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setSettingsOpen(false) }} className="relative z-10 flex-1 h-8 text-xs font-medium rounded-md transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}