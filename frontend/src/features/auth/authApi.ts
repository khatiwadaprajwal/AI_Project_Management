import apiClient from '../../lib/api-client'
import type { RegisterInput, LoginInput, VerifyOtpInput, ChangePasswordInput } from './types'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  token?: string
}

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<ApiResponse<{ email: string }>>('/auth/register', data),

  verifyOtp: (data: VerifyOtpInput) =>
    apiClient.post<ApiResponse<{ user: any; workspaces: any[]; refreshToken: string }>>('/auth/verify-otp', data),

  login: (data: LoginInput) =>
    apiClient.post<ApiResponse<{ user: any; workspaces: any[]; refreshToken: string }>>('/auth/login', data),

  changePassword: (data: ChangePasswordInput) =>
    apiClient.post<ApiResponse<{ user: any; workspaces: any[]; refreshToken: string }>>('/auth/change-password', data),
}
