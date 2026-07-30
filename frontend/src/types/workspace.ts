export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'LEAD' | 'DEVELOPER' | 'QA' | 'SUPERVISOR' | 'MEMBER'

export interface Workspace {
  id: string
  name: string
  slug: string
  role: WorkspaceRole
}

export interface WorkspaceMember {
  userId: string
  name: string
  email: string
  role: WorkspaceRole
  joinedAt: string
}

export interface CreateWorkspaceInput {
  name: string
}

export interface UpdateWorkspaceInput {
  name?: string
}

export interface InviteMemberInput {
  name: string
  email: string
  role: WorkspaceRole
}
