'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'default' | 'large'
  isLoading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        'relative flex items-center justify-center gap-4',
        'font-display font-bold text-lg',
        'rounded-[32px] transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'primary' && [
          'bg-gradient-to-br from-primary to-secondary',
          'text-white',
          'shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.3)]',
          'hover:shadow-[0px_25px_50px_-10px_rgba(0,35,111,0.4)]',
          'active:scale-[0.98]',
        ],
        variant === 'secondary' && [
          'bg-[rgba(255,255,255,0.7)]',
          'border border-[rgba(255,255,255,0.5)]',
          'backdrop-blur-xl',
          'text-primary',
          'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]',
          'hover:bg-white',
          'active:scale-[0.98]',
        ],
        variant === 'ghost' && [
          'bg-[#E6E8EA]',
          'text-[#57657B]',
          'hover:bg-[#D5D7D9]',
          'active:scale-[0.98]',
        ],
        variant === 'danger' && [
          'bg-[rgba(255,218,214,0.3)]',
          'text-destructive',
          'hover:bg-[rgba(255,218,214,0.5)]',
          'active:scale-[0.98]',
        ],
        // Sizes
        size === 'default' && 'px-6 py-4 min-h-[54px]',
        size === 'large' && 'px-6 py-6 min-h-[76px] text-xl tracking-[0.5px] uppercase',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shadow overlay */}
      {variant === 'primary' && (
        <div 
          className="absolute inset-0 rounded-[32px] bg-[rgba(255,255,255,0.002)] pointer-events-none"
        />
      )}
      
      {isLoading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex items-center">{icon}</span>
          )}
          <span className="relative z-10">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex items-center">{icon}</span>
          )}
        </>
      )}
    </button>
  )
}
