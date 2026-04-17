'use client'

import { cn } from '@/lib/utils'
import { Home, Clock, ScanLine, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'History', href: '/history', icon: Clock },
  { label: 'Scanner', href: '/scanner', icon: ScanLine },
  { label: 'Profile', href: '/profile', icon: User },
]

interface BottomNavBarProps {
  className?: string
}

export function BottomNavBar({ className }: BottomNavBarProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-1/2 -translate-x-1/2 z-50',
        'w-full max-w-md',
        'flex items-center justify-around',
        'px-4 pt-2',
        'pb-[max(env(safe-area-inset-bottom),16px)]',
        'bg-[rgba(255,255,255,0.95)] backdrop-blur-xl',
        'rounded-t-[24px]',
        'shadow-[0px_-4px_20px_-5px_rgba(0,35,111,0.1)]',
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href === '/dashboard' && pathname === '/') ||
          (item.href === '/scanner' && pathname.startsWith('/scanner'))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              'py-3 px-3 min-w-[58px]',
              'transition-all duration-200',
              isActive && 'rounded-2xl',
              isActive && item.href === '/scanner' && 'bg-accent scale-110',
              isActive && item.href !== '/scanner' && 'bg-secondary',
            )}
          >
            <Icon
              className={cn(
                'w-[18px] h-[18px]',
                isActive ? 'text-white' : 'text-[#64748B]'
              )}
            />
            <span
              className={cn(
                'font-sans font-semibold text-xs leading-4',
                isActive ? 'text-white' : 'text-[#64748B]'
              )}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
