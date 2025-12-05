'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const getPageTitle = (pathname: string): string => {
  const pageTitles: Record<string, string> = {
    '/': 'نظام إدارة العقارات',
    '/dashboard': 'لوحة المعلومات',
    '/dashboard/properties': 'العقارات',
    '/dashboard/units': 'الوحدات',
    '/dashboard/occupancy': 'التقويم',
    '/dashboard/reservations': 'الحجوزات',
    '/dashboard/inbox': 'صندوق الرسائل',
    '/dashboard/channels': 'القنوات',
    '/dashboard/guests': 'الضيوف',
    '/dashboard/smart-locks': 'الأقفال الذكية',
    '/dashboard/tasks': 'المهام',
    '/dashboard/invoices': 'الفواتير',
    '/dashboard/receipts': 'السندات',
    '/dashboard/owner-statements': 'كشوفات الملاك',
    '/dashboard/payment-links': 'روابط الدفع',
    '/dashboard/reports': 'التقارير',
    '/dashboard/settings': 'الإعدادات',
  }

  // Check exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }

  // For dynamic routes or sub-paths, extract the main route
  const pathParts = pathname.split('/')
  if (pathParts[1] === 'dashboard' && pathParts[2]) {
    const fullPath = `/dashboard/${pathParts[2]}`
    if (pageTitles[fullPath]) {
      return pageTitles[fullPath]
    }
  }

  return 'نظام إدارة العقارات'
}

export function PageTitle() {
  const pathname = usePathname()
  const [pageTitle, setPageTitle] = useState('')

  useEffect(() => {
    setPageTitle(getPageTitle(pathname))
  }, [pathname])

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
      <p className="text-muted-foreground mt-1">نظام إدارة العقارات</p>
    </div>
  )
}