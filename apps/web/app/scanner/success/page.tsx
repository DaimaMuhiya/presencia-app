'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { GlassCard, PrimaryButton } from '@/components/presencia'
import { cn } from '@/lib/utils'
import Image from 'next/image'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checkInTime, setCheckInTime] = useState<string>('')
  const [user, setUser] = useState({
    name: 'Daima Muhiya',
    avatar: undefined as string | undefined,
  })

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
      return
    }

    // Get check-in time from URL params or use current time
    const timeParam = searchParams.get('time')
    const time = timeParam ? new Date(timeParam) : new Date()
    setCheckInTime(
      time.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  }, [router, searchParams])

  const handleDone = () => {
    router.push('/dashboard')
  }

  return (
    <div
      className={cn(
        'relative min-h-dvh w-full max-w-md mx-auto',
        'flex flex-col items-center justify-center',
        'px-4 py-8',
        'bg-background',
        'overflow-hidden',
        'safe-area-inset'
      )}
    >
      {/* Background decoration */}
      <div
        className="absolute -left-[5%] -bottom-[10%] w-[480px] h-[480px]
          bg-[rgba(213,227,253,0.2)] blur-[40px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <GlassCard variant="success" className="w-full">
          <div className="flex flex-col items-center p-6 gap-8">
            {/* Success Visual Anchor */}
            <div className="relative">
              {/* Outer ring */}
              <div
                className={cn(
                  'w-24 h-24 rounded-full',
                  'bg-white',
                  'border border-[rgba(30,58,138,0.2)]',
                  'flex items-center justify-center'
                )}
              >
                {/* Icon container */}
                <div
                  className={cn(
                    'w-18 h-18 rounded-full',
                    'bg-gradient-to-br from-primary to-secondary',
                    'shadow-[0px_10px_15px_-3px_rgba(0,35,111,0.2),0px_4px_6px_-4px_rgba(0,35,111,0.2)]',
                    'flex items-center justify-center'
                  )}
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Decorative sparkles */}
              <div className="absolute -right-3 -top-1 opacity-40">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div className="absolute -left-4 bottom-3 opacity-30">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Content Hierarchy */}
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="font-display font-extrabold text-3xl text-primary tracking-tight">
                Succes!
              </h1>

              <div className="flex flex-col items-center gap-0.5">
                <span className="font-sans font-medium text-sm text-muted-foreground">
                  Pointe a
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-4xl text-[#444651]">
                    {checkInTime || '--:--'}
                  </span>
                  <span className="font-display font-bold text-xl text-muted-foreground">
                    AM
                  </span>
                </div>
              </div>
            </div>

            {/* Contextual Details */}
            <div
              className={cn(
                'w-full flex items-center justify-between',
                'p-4 bg-muted rounded-[24px]'
              )}
            >
              {/* User info */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full overflow-hidden',
                    'border-2 border-white',
                    'shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                  )}
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-base text-foreground leading-6">
                    {user.name.split(' ').map((word, i) => (
                      <span key={i} className="block">
                        {word}
                      </span>
                    ))}
                  </span>
                  <span className="font-sans text-xs text-muted-foreground">
                    Employee
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-1">
                <span className="font-sans font-bold text-xs tracking-[1.2px] uppercase text-primary">
                  Status
                </span>
                <div
                  className={cn(
                    'flex items-center gap-2',
                    'px-3 py-2',
                    'bg-success-bg rounded-full'
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="font-sans font-bold text-xs text-success-foreground">
                    Checked In
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <PrimaryButton
              variant="ghost"
              onClick={handleDone}
              icon={<ArrowRight className="w-3 h-3" />}
              iconPosition="right"
              className="w-full"
            >
              Fermer
            </PrimaryButton>
          </div>
        </GlassCard>

        {/* Footnote */}
        <p className="font-sans font-medium text-xs tracking-[1.2px] uppercase text-muted-foreground opacity-60 text-center">
          Presencia - Pointage Intelligent
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
