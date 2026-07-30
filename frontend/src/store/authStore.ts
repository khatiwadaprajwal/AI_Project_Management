import { create } from 'zustand'
import type { User, Workspace } from '@/lib/api/auth'

interface AuthState {
  token: string | null
  user: User | null
  workspaces: Workspace[]
  isAuthenticated: boolean
  setAuth: (token: string, user: User, workspaces: Workspace[]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  workspaces: [],
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (token, user, workspaces) => {
    localStorage.setItem('token', token)
    set({ token, user, workspaces, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, workspaces: [], isAuthenticated: false })
  },
}))
