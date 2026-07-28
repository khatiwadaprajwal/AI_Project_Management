import { type ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-surface-sunken">
      {/* Left Panel - Clean Image & Gradient */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80"
          alt="Workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        {/* Smooth gradient from bottom up */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        
        {/* Text properly padded at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-bold text-white shadow-sm">
              S
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              SDLC Manager
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-slate-300">
            Streamline your software development lifecycle. Manage projects, assign tasks, and leverage AI insights all in one unified workspace.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  )
}