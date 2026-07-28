import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorkspaceInfo {
  id: string
  name: string
  slug: string
  role: string
}

export interface UserInfo {
  id: string
  name: string
  email: string
  isFirstLogin: boolean
}

interface AuthState {
  user: UserInfo | null
  workspaces: WorkspaceInfo[]
  accessToken: string | null
  refreshToken: string | null
  activeWorkspaceId: string | null
  setAuth: (data: {
    user: UserInfo
    workspaces: WorkspaceInfo[]
    accessToken: string
    refreshToken: string
  }) => void
  setActiveWorkspace: (workspaceId: string) => void
  updateWorkspaces: (workspaces: WorkspaceInfo[]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspaces: [],
      accessToken: null,
      refreshToken: null,
      activeWorkspaceId: null,
      setAuth: (data) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        set({
          user: data.user,
          workspaces: data.workspaces,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          activeWorkspaceId: data.workspaces[0]?.id ?? null,
        })
      },
      setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
      updateWorkspaces: (workspaces) => set({ workspaces }),
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          workspaces: [],
          accessToken: null,
          refreshToken: null,
          activeWorkspaceId: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        workspaces: state.workspaces,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    },
  ),
)
