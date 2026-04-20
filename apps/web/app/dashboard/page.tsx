'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, MapPin, ScanLine } from 'lucide-react'
import { AppLayout, PrimaryButton, StatusCard } from '@/components/presencia'

interface UserData {
  name: string
  firstName?: string
  avatar?: string
}

interface TodayStatus {
  checkedIn: boolean
  checkInTime?: string
  location?: string
}

/** Données de démo — à remplacer par un fetch API */
const MOCK_USER: UserData = {
  name: 'Daima Muhiya',
  firstName: 'Daima',
  avatar: undefined,
}

const MOCK_TODAY_STATUS: TodayStatus = {
  checkedIn: false,
  checkInTime: undefined,
  location: 'HQ - West Tower',
}

const noopSubscribe = () => () => {}

/** true côté navigateur après hydratation — évite les divergences SSR / client pour l’horloge */
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

export default function DashboardPage() {
  const router = useRouter()
  const isClient = useIsClient()
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [user, setUser] = useState<UserData | null>(null)
  const [todayStatus] = useState<TodayStatus>(MOCK_TODAY_STATUS)

  // Vérification auth (localStorage) — pas de setState synchrone pour les mocks
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
      return
    }
    queueMicrotask(() => {
      setUser(MOCK_USER)
    })
  }, [router])

  useEffect(() => {
    if (!isClient) return
    let raf = 0
    const tick = () => setCurrentTime(new Date())
    raf = requestAnimationFrame(tick)
    const timer = setInterval(tick, 1000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [isClient])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatSeconds = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      second: '2-digit',
    }).slice(-2)
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon apres-midi'
    return 'Bonsoir'
  }

  const handleScanPress = () => {
    router.push('/scanner')
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout profileImage={user.avatar}>
      <div className="flex flex-col gap-6 py-4">
        {/* Hero Section: Clock & Identity */}
        <section className="flex flex-col gap-6">
          {/* Greeting */}
          <div className="flex flex-col gap-1">
            <span className="font-sans font-semibold text-[10px] tracking-[1.2px] uppercase text-muted-foreground opacity-60">
              {isClient ? formatDate() : '—'}
            </span>
            <h1 className="font-display font-extrabold text-2xl text-primary leading-tight">
              {user.name}
            </h1>
          </div>

          {/* Large Clock Display */}
          <div className="relative pl-3">
            {/* Decorative bar */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary opacity-20 rounded-full"
              aria-hidden="true"
            />
            
            <div className="flex items-end gap-1">
              <span className="font-display font-extrabold text-[56px] leading-none tracking-[-2px] text-primary">
                {isClient ? formatTime(currentTime) : '--:--'}
              </span>
              <span className="font-display font-bold text-lg text-[#D5E3FD] pb-1">
                {isClient ? formatSeconds(currentTime) : '--'}
              </span>
            </div>
          </div>

          {/* Welcome message */}
          <p className="font-sans font-medium text-sm text-muted-foreground leading-relaxed">
            {isClient ? getGreeting() : 'Bonjour'}, <strong>{user.firstName || user.name}</strong>. 
            {todayStatus.checkedIn 
              ? ' Vous etes pointe pour aujourd\'hui.'
              : ' Pret a pointer votre presence?'}
          </p>
        </section>

        {/* Status Bento Grid */}
        <section className="flex flex-col gap-3">
          {/* Clock Status Card */}
          <StatusCard
            icon={<Clock className="w-4 h-4 text-primary" />}
            label="Heure de pointage"
            subLabel="Derniere entree"
            value={todayStatus.checkInTime || '--:--'}
            variant="primary"
          />

          {/* Location Card */}
          <StatusCard
            icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
            label="Emplacement"
            subLabel="Site de travail"
            value={todayStatus.location || 'Non defini'}
            variant="secondary"
          />
        </section>

        {/* Scan Action Button */}
        <section className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
          <PrimaryButton
            onClick={handleScanPress}
            size="large"
            icon={<ScanLine className="w-5 h-5 text-white" />}
            className="w-full"
          >
            Scanner pour pointer
          </PrimaryButton>
        </section>
      </div>
    </AppLayout>
  )
}
