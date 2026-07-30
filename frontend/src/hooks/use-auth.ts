import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authApi from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import type { RegisterPayload, VerifyOtpPayload, LoginPayload } from '@/lib/api/auth'

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.registerUser(payload),
  })
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
    onSuccess: (res) => {
      const token = res.data.token!
      const data = res.data.data!
      if ('user' in data) {
        setAuth(token, data.user, data.workspaces)
        navigate('/')
      }
    },
  })
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.loginUser(payload),
    onSuccess: (res) => {
      const token = res.data.token!
      const data = res.data.data!
      if ('user' in data) {
        setAuth(token, data.user, data.workspaces)
        navigate('/')
      }
    },
  })
}
