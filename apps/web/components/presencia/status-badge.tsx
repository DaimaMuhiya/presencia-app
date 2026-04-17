import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

type StatusType = 'present' | 'late' | 'absent' | 'early_leave' | 'success' | 'pending'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  showIcon?: boolean
  className?: string
}

const statusConfig = {
  present: {
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    icon: CheckCircle,
    defaultLabel: 'CHECKED IN',
  },
  success: {
    bg: 'bg-success-bg',
    text: 'text-success-foreground',
    icon: CheckCircle,
    defaultLabel: 'SUCCESS',
  },
  late: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    icon: Clock,
    defaultLabel: 'LATE',
  },
  absent: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    icon: XCircle,
    defaultLabel: 'ABSENT',
  },
  early_leave: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    icon: AlertCircle,
    defaultLabel: 'EARLY LEAVE',
  },
  pending: {
    bg: 'bg-[#E6E8EA]',
    text: 'text-[#515F74]',
    icon: Clock,
    defaultLabel: 'PENDING',
  },
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        'px-4 py-2',
        'rounded-full',
        config.bg,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn('w-4 h-4', config.text)} />
      )}
      <span
        className={cn(
          'font-sans font-bold text-xs',
          'tracking-[0.3px] uppercase',
          config.text
        )}
      >
        {label || config.defaultLabel}
      </span>
    </div>
  )
}

// GPS Status Pill for Scanner
interface GPSStatusPillProps {
  isActive: boolean
  label?: string
  className?: string
}

export function GPSStatusPill({
  isActive,
  label = 'GPS POSITION VERIFIED',
  className,
}: GPSStatusPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        'px-6 py-2',
        'bg-[rgba(255,255,255,0.1)]',
        'border border-[rgba(255,255,255,0.2)]',
        'backdrop-blur-lg',
        'rounded-full',
        'shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]',
        className
      )}
    >
      <div className="relative">
        {isActive && (
          <div className="absolute inset-0 bg-[#34D399] opacity-75 rounded-full animate-ping" />
        )}
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            isActive ? 'bg-[#10B981]' : 'bg-[#64748B]'
          )}
        />
      </div>
      <span className="font-sans font-semibold text-sm tracking-[0.35px] uppercase text-white">
        {label}
      </span>
    </div>
  )
}
