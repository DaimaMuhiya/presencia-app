'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Lock, LogOut, ChevronRight, BadgeCheck } from 'lucide-react'
import { GlassCard, BottomNavBar } from '@/components/presencia'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  position: string
  employeeId: string
  department: string
  joiningDate: string
  workStatus: 'active' | 'inactive' | 'on_leave'
  avatar?: string
}

/** Données de démo — remplacer par un fetch API */
const MOCK_USER: UserProfile = {
  id: '1',
  name: 'Daima Muhiya',
  position: 'Software Developer',
  employeeId: 'TR-99021',
  department: 'Development',
  joiningDate: 'Jan 2022',
  workStatus: 'active',
  avatar: undefined,
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
      return
    }

    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) setUser(MOCK_USER)
    })
    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  const menuItems = [
    {
      icon: Bell,
      label: 'Preferences de notification',
      onClick: () => {},
      variant: 'default' as const,
    },
    {
      icon: Lock,
      label: 'Changer mot de passe',
      onClick: () => {},
      variant: 'default' as const,
    },
    {
      icon: LogOut,
      label: 'Deconnexion',
      onClick: handleLogout,
      variant: 'danger' as const,
    },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-[100px]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-[rgba(248,250,252,0.7)] backdrop-blur-md safe-area-top">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Retour"
            title="Retour"
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
          </button>
          <h1 className="font-display font-bold text-base text-primary">Profile</h1>
        </div>
        <button
          type="button"
          aria-label="Menu"
          title="Menu"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors active:scale-95"
        >
          <div className="w-1 h-4 flex flex-col gap-1" aria-hidden>
            <div className="w-1 h-1 rounded-full bg-primary" />
            <div className="w-1 h-1 rounded-full bg-primary" />
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
        </button>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Hero Profile Section */}
        <section className="flex flex-col items-center gap-3">
          {/* Avatar with verification badge */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-secondary p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={88}
                    height={88}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            {/* Verification badge */}
            <div className="absolute -right-0 -bottom-0 w-7 h-7 rounded-full bg-primary border-3 border-background flex items-center justify-center">
              <BadgeCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Name and Position */}
          <div className="flex flex-col items-center gap-0.5">
            <h2 className="font-display font-extrabold text-xl text-primary tracking-tight">
              {user.name}
            </h2>
            <span className="font-sans font-semibold text-xs text-muted-foreground">
              {user.position}
            </span>
          </div>
        </section>

        {/* Professional Info Card */}
        <GlassCard className="p-5">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-primary">
              Informations professionnelles
            </h3>

            <div className="space-y-5">
              {/* Employee ID */}
              <div className="space-y-0.5">
                <span className="font-sans font-bold text-[9px] tracking-[1px] uppercase text-[#57657B]">
                  Numero d&apos;employe
                </span>
                <p className="font-display font-bold text-base text-secondary">
                  {user.employeeId}
                </p>
              </div>

              {/* Department */}
              <div className="space-y-0.5">
                <span className="font-sans font-bold text-[9px] tracking-[1px] uppercase text-[#57657B]">
                  Departement
                </span>
                <p className="font-display font-bold text-base text-secondary">
                  {user.department}
                </p>
              </div>

              {/* Joining Date */}
              <div className="space-y-0.5">
                <span className="font-sans font-bold text-[9px] tracking-[1px] uppercase text-[#57657B]">
                  Date d&apos;embauche
                </span>
                <p className="font-display font-bold text-base text-secondary">
                  {user.joiningDate}
                </p>
              </div>

              {/* Work Status */}
              <div className="space-y-0.5">
                <span className="font-sans font-bold text-[9px] tracking-[1px] uppercase text-[#57657B]">
                  Statut de travail
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      user.workStatus === 'active' && 'bg-success',
                      user.workStatus === 'inactive' && 'bg-destructive',
                      user.workStatus === 'on_leave' && 'bg-[#F59E0B]'
                    )}
                  />
                  <p className="font-display font-bold text-base text-secondary">
                    {user.workStatus === 'active' && 'Actif'}
                    {user.workStatus === 'inactive' && 'Inactif'}
                    {user.workStatus === 'on_leave' && 'En conge'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Settings List */}
        <section className="space-y-3">
          <h3 className="font-display font-bold text-base text-primary px-1">
            Parametres du compte
          </h3>

          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center justify-between',
                  'p-4 rounded-[20px]',
                  'transition-all duration-200 active:scale-[0.98]',
                  item.variant === 'default' && 'bg-white hover:bg-muted',
                  item.variant === 'danger' && 'bg-[rgba(255,218,214,0.3)] hover:bg-[rgba(255,218,214,0.5)]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center',
                      item.variant === 'default' && 'bg-[#D5E3FD]',
                      item.variant === 'danger' && 'bg-[#FFDAD6]'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-4 h-4',
                        item.variant === 'default' && 'text-primary',
                        item.variant === 'danger' && 'text-destructive'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'font-sans font-semibold text-sm',
                      item.variant === 'default' && 'text-foreground',
                      item.variant === 'danger' && 'text-destructive'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {item.variant === 'default' && (
                  <ChevronRight className="w-4 h-4 text-[#757682]" />
                )}
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  )
}
