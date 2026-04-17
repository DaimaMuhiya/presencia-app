import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'tonal' | 'gradient' | 'success'
}

export function GlassCard({ 
  children, 
  className,
  variant = 'default' 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[32px]',
        'backdrop-blur-[5px]',
        // Variants
        variant === 'default' && [
          'bg-[rgba(255,255,255,0.7)]',
          'border border-[rgba(0,35,111,0.15)]',
          'shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.08)]',
        ],
        variant === 'tonal' && [
          'bg-muted',
        ],
        variant === 'gradient' && [
          'bg-gradient-to-br from-primary to-secondary',
          'shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.3)]',
        ],
        variant === 'success' && [
          'bg-[rgba(255,255,255,0.7)]',
          'border border-[rgba(0,35,111,0.15)]',
          'backdrop-blur-[5px]',
          'shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.08)]',
        ],
        className
      )}
    >
      {/* Shadow overlay for better depth */}
      <div 
        className={cn(
          'absolute inset-0 rounded-[32px] pointer-events-none',
          variant === 'default' && 'bg-[rgba(255,255,255,0.002)]',
          variant === 'gradient' && 'bg-[rgba(255,255,255,0.002)]',
        )} 
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Status Card Component
interface StatusCardProps {
  icon: ReactNode
  label: string
  value: string
  subLabel?: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function StatusCard({
  icon,
  label,
  value,
  subLabel,
  variant = 'primary',
  className,
}: StatusCardProps) {
  return (
    <GlassCard
      variant={variant === 'primary' ? 'default' : 'tonal'}
      className={cn('p-8', className)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full',
              variant === 'primary' 
                ? 'bg-[rgba(0,35,111,0.1)]' 
                : 'bg-[rgba(81,95,116,0.1)]'
            )}
          >
            {icon}
          </div>
          <span
            className={cn(
              'font-display font-bold text-base',
              variant === 'primary' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
        </div>

        <div className="flex flex-col gap-1 pt-4">
          {subLabel && (
            <span className="font-sans font-medium text-sm text-muted-foreground">
              {subLabel}
            </span>
          )}
          <span
            className={cn(
              'font-display font-extrabold text-3xl tracking-tight',
              variant === 'primary' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {value}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
