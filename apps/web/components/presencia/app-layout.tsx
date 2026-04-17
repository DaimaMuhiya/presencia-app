'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TopAppBar } from './top-app-bar'
import { BottomNavBar } from './bottom-nav-bar'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  showBackButton?: boolean
  showLogo?: boolean
  showProfile?: boolean
  showMenu?: boolean
  showBottomNav?: boolean
  profileImage?: string
  onBackClick?: () => void
  onMenuClick?: () => void
  className?: string
  contentClassName?: string
}

export function AppLayout({
  children,
  title,
  showBackButton = false,
  showLogo = true,
  showProfile = true,
  showMenu = false,
  showBottomNav = true,
  profileImage,
  onBackClick,
  onMenuClick,
  className,
  contentClassName,
}: AppLayoutProps) {
  return (
    <div className={cn(
      'min-h-dvh bg-background',
      'flex flex-col',
      'safe-area-inset',
      className
    )}>
      <TopAppBar
        title={title}
        showBackButton={showBackButton}
        showLogo={showLogo}
        showProfile={showProfile}
        showMenu={showMenu}
        profileImage={profileImage}
        onBackClick={onBackClick}
        onMenuClick={onMenuClick}
      />
      
      <main
        className={cn(
          'flex-1',
          'pt-16',
          showBottomNav && 'pb-[100px]',
          'px-4',
          contentClassName
        )}
      >
        {children}
      </main>

      {showBottomNav && <BottomNavBar />}
    </div>
  )
}
