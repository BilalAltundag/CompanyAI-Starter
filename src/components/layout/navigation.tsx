'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Home,
  MessageSquare,
  Database,
  User,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  Settings,
  Shield
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { currentUser, settings, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/giris')
  }

  const navItems = [
    { icon: Home, label: 'Ana Sayfa', href: '/dashboard' },
    { icon: MessageSquare, label: 'Chatbotlar', href: '/chat' },
    { icon: Database, label: 'Veriler', href: '/data' },
    { icon: User, label: 'Profil', href: '/profile' }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/data?search=${encodeURIComponent(q)}`)
    setQuery('')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              {settings?.companyName || 'Company AI'}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Search and Notifications */}
          <div className="hidden md:flex items-center space-x-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ara..."
                  className="pl-9 w-48"
                />
              </div>
              <Button type="submit" variant="ghost" size="sm">
                Ara
              </Button>
            </form>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium">{currentUser?.fullName}</p>
                    <p className="text-xs text-gray-500">@{currentUser?.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {currentUser?.role === 'admin' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Yönetici
                        </span>
                      )}
                      {currentUser?.role === 'leader' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Departman Lideri
                        </span>
                      )}
                      {currentUser?.role === 'employee' && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          Çalışan
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {currentUser?.role === 'admin' && (
                    <Link href="/ayarlar" onClick={() => setShowUserMenu(false)}>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Sistem Ayarları
                      </button>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
            <div className="px-2 pb-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ara..."
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  Ara
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
