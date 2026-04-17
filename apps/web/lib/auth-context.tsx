'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api, { User, LoginRequest } from './api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          const response = await api.getCurrentUser()
          if (response.success) {
            setUser(response.data)
          } else {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('isAuthenticated')
          }
        }
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('isAuthenticated')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await api.login(credentials)
      if (response.success && response.data) {
        setUser(response.data.user)
        localStorage.setItem('isAuthenticated', 'true')
        router.push('/dashboard')
      } else {
        throw new Error(response.message || 'Erreur de connexion')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await api.logout()
    } catch {
      // Continue with logout even if API fails
    } finally {
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('isAuthenticated')
      setIsLoading(false)
      router.push('/')
    }
  }

  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser()
      if (response.success) {
        setUser(response.data)
      }
    } catch {
      // Handle error silently
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
