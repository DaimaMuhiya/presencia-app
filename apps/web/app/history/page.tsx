'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout, GlassCard, StatusBadge } from '@/components/presencia'
import { cn } from '@/lib/utils'

interface AttendanceLog {
  id: string
  date: string
  day: number
  dayName: string
  checkIn: string
  status: 'present' | 'late' | 'absent' | 'early_leave'
}

interface AttendanceGroup {
  month: string
  year: number
  count: number
  logs: AttendanceLog[]
}

// Mock data
const mockAttendanceData: AttendanceGroup[] = [
  {
    month: 'Octobre',
    year: 2024,
    count: 22,
    logs: [
      { id: '1', date: '2024-10-15', day: 15, dayName: 'MAR', checkIn: '08:45 AM', status: 'present' },
      { id: '2', date: '2024-10-14', day: 14, dayName: 'LUN', checkIn: '08:52 AM', status: 'present' },
      { id: '3', date: '2024-10-11', day: 11, dayName: 'VEN', checkIn: '09:05 AM', status: 'late' },
    ],
  },
  {
    month: 'Septembre',
    year: 2024,
    count: 20,
    logs: [
      { id: '4', date: '2024-09-30', day: 30, dayName: 'LUN', checkIn: '08:30 AM', status: 'present' },
      { id: '5', date: '2024-09-27', day: 27, dayName: 'VEN', checkIn: '08:48 AM', status: 'present' },
    ],
  },
]

export default function HistoryPage() {
  const router = useRouter()
  const [attendanceData, setAttendanceData] = useState<AttendanceGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalThisMonth, setTotalThisMonth] = useState(0)

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
      return
    }

    // Simulate API call
    setTimeout(() => {
      setAttendanceData(mockAttendanceData)
      setTotalThisMonth(mockAttendanceData[0]?.count || 0)
      setIsLoading(false)
    }, 500)
  }, [router])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 py-8 max-w-2xl mx-auto">
        {/* Summary Card */}
        <section>
          <div
            className={cn(
              'relative overflow-hidden',
              'p-8 rounded-[32px]',
              'bg-gradient-to-br from-primary to-secondary',
              'shadow-[0px_20px_40px_-10px_rgba(0,35,111,0.15)]'
            )}
          >
            {/* Background decorations */}
            <div
              className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 blur-[32px] rounded-full"
              aria-hidden="true"
            />
            <div
              className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/30 blur-[20px] rounded-full"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col gap-2">
              <span className="font-display font-semibold text-xs tracking-[1.2px] uppercase text-[#90A8FF]">
                Apercu mensuel
              </span>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="font-display font-extrabold text-5xl text-white">
                  {totalThisMonth}
                </span>
                <span className="font-display font-bold text-2xl text-white">
                  jours
                </span>
              </div>

              <span className="font-sans text-sm text-[#90A8FF] pt-2">
                Total de presences enregistrees en {attendanceData[0]?.month || 'ce mois'}
              </span>
            </div>
          </div>
        </section>

        {/* Attendance Logs */}
        <section className="flex flex-col gap-8">
          {attendanceData.map((group) => (
            <div key={`${group.month}-${group.year}`} className="flex flex-col gap-6">
              {/* Month Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-primary">
                  {group.month} {group.year}
                </h2>
                <span
                  className={cn(
                    'px-3 py-1',
                    'bg-[#E6E8EA] rounded-full',
                    'font-sans font-semibold text-xs tracking-[0.6px] uppercase text-muted-foreground'
                  )}
                >
                  {group.count} jours
                </span>
              </div>

              {/* Log List */}
              <div className="flex flex-col gap-4">
                {group.logs.map((log) => (
                  <GlassCard key={log.id} className="p-5">
                    <div className="flex items-center justify-between">
                      {/* Left: Date and Time */}
                      <div className="flex items-center gap-4">
                        {/* Date circle */}
                        <div
                          className={cn(
                            'w-14 h-14 rounded-[32px]',
                            'bg-muted',
                            'flex flex-col items-center justify-center'
                          )}
                        >
                          <span className="font-display font-bold text-lg text-primary">
                            {log.day}
                          </span>
                          <span className="font-sans font-bold text-[10px] tracking-tight uppercase text-muted-foreground">
                            {log.dayName}
                          </span>
                        </div>

                        {/* Check-in time */}
                        <div className="flex flex-col gap-1">
                          <span className="font-sans font-semibold text-[10px] tracking-[0.5px] uppercase text-[#444651]">
                            Pointe a
                          </span>
                          <span className="font-display font-bold text-lg text-foreground">
                            {log.checkIn}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status Badge */}
                      <StatusBadge 
                        status={log.status}
                        label={
                          log.status === 'present' ? 'CHECKED IN' :
                          log.status === 'late' ? 'LATE' :
                          log.status === 'absent' ? 'ABSENT' : 'EARLY'
                        }
                      />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppLayout>
  )
}
