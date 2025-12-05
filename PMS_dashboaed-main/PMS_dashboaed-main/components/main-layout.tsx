'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { PageTitle } from '@/components/page-title'
import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Content wrapper with padding for the fixed header */}
      <div className="pt-16 ml-0 mr-64"> 
        <main className="p-8">
          <PageTitle />
          {children}
        </main>
      </div>
    </div>
  )
}
