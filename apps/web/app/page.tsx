'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Fingerprint, Eye, EyeOff } from 'lucide-react'
import { AuthLayout, LogoBranding, GlassCard, PrimaryButton } from '@/components/presencia'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Simulate API call - Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // For demo, accept any credentials
      if (email && password) {
        // Store auth state (in real app, store token from API)
        localStorage.setItem('isAuthenticated', 'true')
        router.push('/dashboard')
      } else {
        setError('Veuillez remplir tous les champs')
      }
    } catch {
      setError('Erreur de connexion. Veuillez reessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Check if Web Authentication API is available
      if (window.PublicKeyCredential) {
        // Simulate biometric auth
        await new Promise((resolve) => setTimeout(resolve, 1000))
        localStorage.setItem('isAuthenticated', 'true')
        router.push('/dashboard')
      } else {
        setError('Authentification biometrique non disponible')
      }
    } catch {
      setError('Echec de l\'authentification biometrique')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <LogoBranding />

      <GlassCard className="w-full">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="font-display font-bold text-2xl text-foreground">
              Bienvenue
            </h2>
            <p className="font-sans text-sm text-[#444651] leading-5">
              Veuillez entrer vos identifiants pour acceder a votre tableau de bord.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[rgba(186,26,26,0.1)] rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block font-sans font-bold text-sm tracking-[0.7px] uppercase text-primary">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-4 h-4 text-[#94A3B8]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="daima.muhiya@ikwook.cd"
                  className={cn(
                    'w-full pl-12 pr-4 py-4',
                    'bg-input rounded-md',
                    'font-sans text-base text-foreground',
                    'placeholder:text-[#94A3B8]',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="font-sans font-bold text-sm tracking-[0.7px] uppercase text-primary">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="font-sans font-semibold text-xs text-primary hover:underline"
                >
                  Oublie?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-4 h-4 text-[#94A3B8]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full pl-12 pr-12 py-4',
                    'bg-input rounded-md',
                    'font-sans text-base text-foreground',
                    'placeholder:text-[#94A3B8]',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'transition-all duration-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#94A3B8]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={cn(
                  'w-4 h-4',
                  'border border-[#C5C5D3] rounded-sm',
                  'checked:bg-primary checked:border-primary',
                  'focus:ring-2 focus:ring-primary/20'
                )}
              />
              <label
                htmlFor="rememberMe"
                className="font-sans font-medium text-sm text-[#444651]"
              >
                Garder ma session active
              </label>
            </div>

            {/* Submit Button */}
            <PrimaryButton
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Connexion
            </PrimaryButton>
          </form>

          {/* Biometric Section */}
          <div className="pt-8 border-t border-[rgba(226,232,240,0.5)]">
            <div className="flex flex-col items-center gap-6">
              <span className="font-sans font-bold text-xs tracking-[2.4px] uppercase text-[#94A3B8]">
                Ou utilisez la biometrie
              </span>

              <button
                onClick={handleBiometricLogin}
                disabled={isLoading}
                className={cn(
                  'flex flex-col items-center gap-3',
                  'p-4 rounded-[32px]',
                  'transition-all duration-200',
                  'hover:bg-muted',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-16 h-16 rounded-full',
                    'border-2 border-[rgba(0,35,111,0.2)]',
                    'flex items-center justify-center',
                    'transition-all duration-200',
                    'hover:border-primary hover:scale-105'
                  )}
                >
                  <Fingerprint className="w-7 h-7 text-primary" />
                </div>
                <span className="font-sans font-semibold text-sm text-[#444651]">
                  Empreinte digitale
                </span>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1">
        <span className="font-sans font-medium text-sm text-[#444651]">
          Pas encore de compte?
        </span>
        <Link
          href="/request-access"
          className="font-sans font-bold text-sm text-primary hover:underline"
        >
          Demander l&apos;acces
        </Link>
      </div>
    </AuthLayout>
  )
}
