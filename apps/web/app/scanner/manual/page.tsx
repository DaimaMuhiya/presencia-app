'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GlassCard, PrimaryButton, TopAppBar } from '@/components/presencia'
import { cn } from '@/lib/utils'

export default function ManualEntryPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!code.trim()) {
      setError('Veuillez entrer un code')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to success
      router.push(`/scanner/success?code=${encodeURIComponent(code)}&time=${new Date().toISOString()}`)
    } catch {
      setError('Code invalide. Veuillez reessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar
        title="Code manuel"
        showBackButton
        onBackClick={() => router.back()}
      />

      <main className="pt-20 px-6 pb-8">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-8">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-2">
                  Entrer le code manuellement
                </h2>
                <p className="font-sans text-sm text-muted-foreground">
                  Entrez le code affiche sur le dispositif de pointage.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-[rgba(186,26,26,0.1)] rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="block font-sans font-bold text-sm tracking-[0.7px] uppercase text-primary">
                    Code de pointage
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="EX: QR-2024-001"
                    className={cn(
                      'w-full px-4 py-4',
                      'bg-input rounded-lg',
                      'font-mono text-lg text-foreground tracking-wider',
                      'placeholder:text-[#94A3B8] placeholder:font-sans placeholder:text-base',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20',
                      'transition-all duration-200 text-center'
                    )}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Valider
                </PrimaryButton>
              </form>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}
