'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useTheme, ThemeMode } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Home, FileText, MessageSquare, Settings, LogOut, Users, BarChart, HelpCircle, Sun, Moon, Monitor } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const { mode, setMode, isDark } = useTheme()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getNavItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/users', icon: Users, label: 'Users' },
        { href: '/dashboard/deals', icon: FileText, label: 'Deals' },
        { href: '/dashboard/audit', icon: BarChart, label: 'Audit Logs' },
      ]
    }

    if (user?.role === 'BROKER') {
      return [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/deals', icon: FileText, label: 'Browse Deals' },
        { href: '/dashboard/my-bids', icon: FileText, label: 'My Bids' },
        { href: '/dashboard/connections', icon: MessageSquare, label: 'Connections' },
        { href: '/dashboard/subscription', icon: Settings, label: 'Subscription' },
        { href: '/dashboard/support', icon: HelpCircle, label: 'Support' },
      ]
    }

    // AFFILIATE
    return [
      { href: '/dashboard', icon: Home, label: 'Dashboard' },
      { href: '/dashboard/my-deals', icon: FileText, label: 'My Deals' },
      { href: '/dashboard/connections', icon: MessageSquare, label: 'Connections' },
      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
      { href: '/dashboard/support', icon: HelpCircle, label: 'Support' },
    ]
  }

  const navItems = getNavItems()

  const getThemeIcon = () => {
    if (mode === 'light') return <Sun className="h-4 w-4" />
    if (mode === 'dark') return <Moon className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-colors">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b dark:border-gray-700">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold dark:text-white">FlowXchange</span>
          </div>

          {/* User Info */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="text-sm font-medium dark:text-white">{user?.email}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="w-full justify-start dark:text-gray-200 dark:hover:bg-gray-700">
                  <item.icon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t dark:border-gray-700">
            <Button variant="ghost" className="w-full justify-start dark:text-gray-200 dark:hover:bg-gray-700" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Top Bar with Theme Switcher */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-4 flex items-center justify-end transition-colors">
          <div className="flex items-center gap-2">
            {getThemeIcon()}
            <Select value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
              <SelectTrigger className="w-[160px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                <SelectItem value="light" className="dark:text-white dark:hover:bg-gray-600">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark" className="dark:text-white dark:hover:bg-gray-600">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="auto" className="dark:text-white dark:hover:bg-gray-600">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Auto
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
