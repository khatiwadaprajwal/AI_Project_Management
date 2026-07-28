export interface RegisterInput {
  name: string
  email: string
  password: string
  workspaceName: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface VerifyOtpInput {
  email: string
  otp: string
}

export interface ChangePasswordInput {
  newPassword: string
}

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

export interface AuthResponse {
  user: UserInfo
  workspaces: WorkspaceInfo[]
  refreshToken: string
}
