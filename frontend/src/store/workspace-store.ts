import { create } from 'zustand'

interface WorkspaceState {
  activeWorkspaceId: string | null
  setActiveWorkspace: (id: string) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: localStorage.getItem('activeWorkspaceId'),
  setActiveWorkspace: (id) => {
    localStorage.setItem('activeWorkspaceId', id)
    set({ activeWorkspaceId: id })
  },
}))
