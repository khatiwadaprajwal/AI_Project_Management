export interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deletedBy: string | null
  deleteReason: string | null
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
  role: string
}

export interface UpdateMemberRoleInput {
  role: string
}

export interface Member {
  userId: string
  name: string
  email: string
  role: string
  joinedAt: string
}
