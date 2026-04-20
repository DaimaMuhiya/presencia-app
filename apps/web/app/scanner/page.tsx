'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Keyboard, Home, Clock, ScanLine, User } from 'lucide-react'
import { TopAppBar, PrimaryButton, GPSStatusPill, BottomNavBar } from '@/components/presencia'
import { cn } from '@/lib/utils'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number | null
}

export default function ScannerPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(true)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'active' | 'error'>('loading')
  const [deviceId, setDeviceId] = useState('T-ARCH-04')
  const [scanProgress, setScanProgress] = useState(50) // Animated scan line position

  // Check authentication
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated')
    if (!isAuth) {
      router.push('/')
    }
  }, [router])

  // Get GPS location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
          setGpsStatus('active')
        },
        (error) => {
          console.error('[v0] GPS Error:', error)
          setGpsStatus('error')
        },
        { enableHighAccuracy: true }
      )
    } else {
      setGpsStatus('error')
    }
  }, [])

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasCamera(true)
        }
      } catch (error) {
        console.error('[v0] Camera Error:', error)
        setHasCamera(false)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Animate scan line
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 1
      })
    }, 20)
    return () => clearInterval(interval)
  }, [])

  // Handle QR code detection
  const handleQRDetected = useCallback((qrCode: string) => {
    if (!isScanning) return
    setIsScanning(false)

    // Simulate successful scan and navigate to success
    setTimeout(() => {
      router.push(`/scanner/success?code=${encodeURIComponent(qrCode)}&time=${new Date().toISOString()}`)
    }, 500)
  }, [isScanning, router])

  // Simulate QR detection for demo (in real app, use a QR scanning library)
  const simulateScan = () => {
    handleQRDetected('QR-2024-PRESENCIA-001')
  }

  const handleManualEntry = () => {
    router.push('/scanner/manual')
  }

  return (
    <div className="relative min-h-dvh bg-background overflow-hidden">
      {/* Camera View */}
      <div className="absolute inset-0 bg-black max-w-md mx-auto">
        {hasCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#00236F] flex items-center justify-center">
            <p className="text-white/60 font-sans text-sm">Camera non disponible</p>
          </div>
        )}
        
        {/* Dark overlay with hole */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 45%, transparent 128px, rgba(0, 35, 111, 0.4) 129px)',
          }}
        />
      </div>

      {/* Scanning HUD */}
      <div className="absolute inset-0 flex flex-col max-w-md mx-auto">
        {/* Top App Bar */}
        <header className="flex items-center justify-between px-4 h-16 bg-[rgba(248,250,252,0.7)] backdrop-blur-md safe-area-top">
          <h1 className="font-sans font-bold text-lg tracking-[2px] text-secondary">
            PRESENCIA
          </h1>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[rgba(0,35,111,0.1)] bg-muted">
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
          </div>
        </header>

        {/* GPS Status Pill */}
        <div className="flex justify-center mt-12">
          <GPSStatusPill 
            isActive={gpsStatus === 'active'} 
            label={
              gpsStatus === 'loading' ? 'LOCALISATION GPS...' :
              gpsStatus === 'active' ? 'GPS POSITION VERIFIEE' :
              'GPS NON DISPONIBLE'
            }
          />
        </div>

        {/* Focus Square */}
        <div className="flex-1 flex items-center justify-center -mt-8">
          <div className="relative w-56 h-56">
            {/* Main border */}
            <div className="absolute inset-0 border-2 border-[rgba(255,255,255,0.3)] rounded-[32px]" />
            
            {/* Corner accents */}
            <div className="absolute top-0.5 left-0.5 w-12 h-12 border-l-4 border-t-4 border-secondary rounded-tl-[32px]" />
            <div className="absolute top-0.5 right-0.5 w-12 h-12 border-r-4 border-t-4 border-secondary rounded-tr-[32px]" />
            <div className="absolute bottom-0.5 left-0.5 w-12 h-12 border-l-4 border-b-4 border-secondary rounded-bl-[32px]" />
            <div className="absolute bottom-0.5 right-0.5 w-12 h-12 border-r-4 border-b-4 border-secondary rounded-br-[32px]" />

            {/* Scanning line effect */}
            <div 
              className="absolute left-0.5 right-0.5 h-0.5"
              style={{
                top: `${scanProgress}%`,
                background: 'linear-gradient(90deg, rgba(144, 168, 255, 0) 0%, #90A8FF 50%, rgba(144, 168, 255, 0) 100%)',
                filter: 'drop-shadow(0px 0px 15px #1E3A8A)',
              }}
            />
          </div>
        </div>

        {/* Technical Metadata Overlay */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex flex-col items-center gap-1">
            <span className="font-sans font-bold text-[10px] tracking-[2px] uppercase text-white/60">
              Scanner le QR Code
            </span>
            <span className="font-display font-bold text-lg text-white">
              Placez le code dans le cadre
            </span>
          </div>

          {/* Device Info Card */}
          <div 
            className={cn(
              'flex items-center justify-between',
              'px-4 py-4 w-full max-w-[240px]',
              'bg-[rgba(30,58,138,0.4)]',
              'border border-[rgba(255,255,255,0.1)]',
              'backdrop-blur-md rounded-[32px]'
            )}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-sans font-bold text-[9px] uppercase text-white/40">
                Device
              </span>
              <span className="font-mono text-xs text-[#DBEAFE]">
                {deviceId}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="font-sans font-bold text-[9px] uppercase text-white/40">
                Zone
              </span>
              <span className="font-mono text-xs text-[#DBEAFE]">
                HQ
              </span>
            </div>
          </div>
        </div>

        {/* Manual Entry Button */}
        <div className="px-4 mb-4">
          <PrimaryButton
            variant="secondary"
            onClick={handleManualEntry}
            icon={<Keyboard className="w-4 h-4 text-primary" />}
            className="w-full"
            size="default"
          >
            Entrer le code manuellement
          </PrimaryButton>
        </div>

        {/* Demo button - For testing */}
        <div className="px-4 mb-4">
          <button
            onClick={simulateScan}
            className="w-full py-2 bg-success text-white rounded-lg text-sm"
          >
            Simuler un scan
          </button>
        </div>

        {/* Bottom Nav Bar */}
        <BottomNavBar />
      </div>

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
