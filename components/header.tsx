'use client'

import { Building2, Bell, Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    // In a real implementation, you would fetch user data from your auth system
    // For now, using mock data
    const mockUser = {
      full_name: "Ahmed Mohamed",
      email: "ahmed@example.com"
    }
    setUser(mockUser)
  }, [])

  return (
    <header className="fixed top-0 right-64 left-0 h-16 bg-background border-b border-border z-30 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <span className="text-lg font-bold text-foreground">Alula Sky</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          {user ? (
            user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-xs font-bold text-primary">{user.full_name?.charAt(0)}</span>
            )
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>
    </header>
  )
}