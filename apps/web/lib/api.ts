// API Service  CodeIgniter 4 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  employeeId: string
  department: string
  position: string
  joiningDate: string
  workStatus: 'active' | 'inactive' | 'on_leave'
  avatar?: string
}

export interface AttendanceLog {
  id: string
  userId: string
  date: string
  day: string
  month: string
  checkIn: string
  checkOut?: string
  status: 'present' | 'late' | 'absent' | 'early_leave'
  location: string
  device?: string
}

export interface AttendanceGroup {
  month: string
  year: number
  count: number
  logs: AttendanceLog[]
}

export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface CheckInRequest {
  qrCode: string
  location: LocationData
  device?: string
  timestamp: string
}

export interface CheckInResponse {
  success: boolean
  message: string
  data?: {
    checkInTime: string
    location: string
    user: User
  }
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    refreshToken?: string
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

class ApiService {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    }

    if (this.token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue')
    }

    return data
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }
    return response
  }

  async logout(): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  async biometricLogin(biometricData: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/biometric', {
      method: 'POST',
      body: JSON.stringify({ biometricData }),
    })
  }

  // User endpoints
  async getCurrentUser(): Promise<{ success: boolean; data: User }> {
    return this.request('/user/me')
  }

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; data: User }> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // Attendance endpoints
  async checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async checkOut(location: LocationData): Promise<CheckInResponse> {
    return this.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ location, timestamp: new Date().toISOString() }),
    })
  }

  async getTodayStatus(): Promise<{
    success: boolean
    data: {
      checkedIn: boolean
      checkInTime?: string
      checkOutTime?: string
      location?: string
    }
  }> {
    return this.request('/attendance/today')
  }

  async getAttendanceHistory(
    page = 1,
    limit = 20
  ): Promise<{
    success: boolean
    data: AttendanceGroup[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    return this.request(`/attendance/history?page=${page}&limit=${limit}`)
  }

  async getMonthlyStats(
    month: number,
    year: number
  ): Promise<{
    success: boolean
    data: {
      totalDays: number
      presentDays: number
      lateDays: number
      absentDays: number
    }
  }> {
    return this.request(`/attendance/stats?month=${month}&year=${year}`)
  }

  // Location validation
  async validateLocation(location: LocationData): Promise<{
    success: boolean
    data: {
      isValid: boolean
      nearestSite?: string
      distance?: number
    }
  }> {
    return this.request('/location/validate', {
      method: 'POST',
      body: JSON.stringify(location),
    })
  }
}

export const api = new ApiService()
export default api
