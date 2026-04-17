import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative min-h-dvh w-full',
        'flex flex-col items-center justify-center',
        'px-4 py-6',
        'bg-background',
        'overflow-hidden',
        'safe-area-inset',
        className
      )}
    >
      {/* Background decorations */}
      <div 
        className="absolute -left-[10%] -top-[10%] w-[40%] h-[40%] 
          bg-[rgba(0,35,111,0.05)] blur-[60px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute -right-[10%] -bottom-[10%] w-[50%] h-[50%] 
          bg-[rgba(30,58,138,0.1)] blur-[75px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-10 w-full flex flex-col gap-6">
        {children}
      </div>
    </div>
  )
}

// Logo branding component
interface LogoBrandingProps {
  className?: string
}

export function LogoBranding({ className }: LogoBrandingProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <h1 className="font-display font-extrabold text-3xl tracking-[3px] text-primary text-center">
        PRESENCIA
      </h1>
      <p className="font-sans font-medium text-base text-muted-foreground text-center tracking-tight">
        Pointage Intelligent par QR Code
      </p>
    </div>
  )
}
