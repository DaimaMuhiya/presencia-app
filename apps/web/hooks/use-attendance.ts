'use client'

import useSWR from 'swr'
import api, { AttendanceGroup, LocationData, CheckInResponse } from '@/lib/api'
import { useState } from 'react'

// Fetcher function for SWR
const fetchAttendanceHistory = async () => {
  const response = await api.getAttendanceHistory()
  if (!response.success) {
    throw new Error('Failed to fetch attendance history')
  }
  return response.data
}

const fetchTodayStatus = async () => {
  const response = await api.getTodayStatus()
  if (!response.success) {
    throw new Error('Failed to fetch today status')
  }
  return response.data
}

// Hook for attendance history
export function useAttendanceHistory() {
  const { data, error, isLoading, mutate } = useSWR<AttendanceGroup[]>(
    'attendance-history',
    fetchAttendanceHistory,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    history: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}

// Hook for today's status
export function useTodayStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    'today-status',
    fetchTodayStatus,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    status: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}

// Hook for check-in action
export function useCheckIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkIn = async (
    qrCode: string,
    location: LocationData,
    device?: string
  ): Promise<CheckInResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.checkIn({
        qrCode,
        location,
        device,
        timestamp: new Date().toISOString(),
      })

      if (!response.success) {
        throw new Error(response.message || 'Check-in failed')
      }

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Check-in failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    checkIn,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}

// Hook for monthly stats
export function useMonthlyStats(month: number, year: number) {
  const { data, error, isLoading } = useSWR(
    ['monthly-stats', month, year],
    async () => {
      const response = await api.getMonthlyStats(month, year)
      if (!response.success) {
        throw new Error('Failed to fetch monthly stats')
      }
      return response.data
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    stats: data,
    isLoading,
    isError: !!error,
    error,
  }
}
