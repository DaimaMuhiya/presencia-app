'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface TopAppBarProps {
  title?: string
  showBackButton?: boolean
  showLogo?: boolean
  showProfile?: boolean
  showMenu?: boolean
  profileImage?: string
  onBackClick?: () => void
  onMenuClick?: () => void
  className?: string
}

export function TopAppBar({
  title,
  showBackButton = false,
  showLogo = false,
  showProfile = false,
  showMenu = false,
  profileImage,
  onBackClick,
  onMenuClick,
  className,
}: TopAppBarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        'px-6 h-16 md:h-[72px]',
        'bg-[rgba(248,250,252,0.7)] backdrop-blur-md',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
        )}
        
        {showLogo ? (
          <Link href="/dashboard">
            <h1 className="font-sans font-bold text-xl tracking-[2px] text-secondary">
              PRESENCIA
            </h1>
          </Link>
        ) : title ? (
          <h1 className="font-display font-bold text-lg text-primary">
            {title}
          </h1>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        {showProfile && (
          <Link href="/profile" className="block">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[rgba(0,35,111,0.1)] bg-muted">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                  U
                </div>
              )}
            </div>
          </Link>
        )}

        {showMenu && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            <MoreVertical className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>
    </header>
  )
}
