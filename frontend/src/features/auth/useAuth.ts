import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from './authApi'
import { useAuthStore } from '../../stores/auth-store'
import type { RegisterInput, LoginInput, VerifyOtpInput, ChangePasswordInput } from './types'

function getApiError(err: unknown): string {
  return (err as any)?.response?.data?.message ?? 'Something went wrong'
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (res) => {
      toast.success(res.data.message)
      const email = res.data.data?.email
      if (email) navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useVerifyOtp() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: VerifyOtpInput) => authApi.verifyOtp(data),
    onSuccess: (res) => {
      toast.success(res.data.message)
      const { token, data } = res.data
      if (token && data) {
        setAuth({
          user: data.user,
          workspaces: data.workspaces,
          accessToken: token,
          refreshToken: data.refreshToken,
        })
        navigate('/dashboard')
      }
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (res) => {
      toast.success(res.data.message)
      const { token, data } = res.data
      if (token && data) {
        if (data.user.isFirstLogin) {
          localStorage.setItem('accessToken', token)
          navigate('/change-password')
          return
        }
        setAuth({
          user: data.user,
          workspaces: data.workspaces,
          accessToken: token,
          refreshToken: data.refreshToken,
        })
        navigate('/dashboard')
      }
    },
    onError: (err) => {
      const msg = getApiError(err)
      if (msg.toLowerCase().includes('password')) {
        toast.error('Incorrect password')
      } else {
        toast.error(msg)
      }
    },
  })
}

export function useChangePassword() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => authApi.changePassword(data),
    onSuccess: (res) => {
      toast.success('Password changed successfully')
      const { token, data } = res.data
      if (token && data) {
        setAuth({
          user: data.user,
          workspaces: data.workspaces,
          accessToken: token,
          refreshToken: data.refreshToken,
        })
        navigate('/dashboard')
      }
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
