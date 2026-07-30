import api from '@/lib/axios'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  workspaceName: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  isFirstLogin: boolean
}

export interface Workspace {
  id: string
  name: string
  slug: string
  role: string
}

export interface AuthData {
  user: User
  workspaces: Workspace[]
  refreshToken: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  data?: AuthData | { email: string }
}

export function registerUser(payload: RegisterPayload) {
  return api.post<{ success: boolean; message: string; data: { email: string } }>('/auth/register', payload)
}

export function verifyOtp(payload: VerifyOtpPayload) {
  return api.post<{ success: boolean; message: string; token: string; data: AuthData }>('/auth/verify-otp', payload)
}

export function loginUser(payload: LoginPayload) {
  return api.post<{ success: boolean; message: string; token: string; data: AuthData }>('/auth/login', payload)
}
