import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Input, Button, FormField } from '../components/ui'
import { loginSchema, type LoginFormData } from '../features/auth/validation'
import { useLogin } from '../features/auth/useAuth'
import { AuthLayout } from '../components/layout/AuthLayout'

export function LoginPage() {
  const login = useLogin()
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: joiResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data)
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h1>
          <p className="text-base text-slate-500">Enter your details to continue to your workspace.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Email address" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              disabled={login.isPending}
              {...register('email')}
            />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              type="password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              autoComplete="current-password"
              disabled={login.isPending}
              {...register('password')}
            />
          </FormField>
          <Button type="submit" variant="accent" size="lg" className="w-full text-base" disabled={login.isPending}>
            {login.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">Register here</Link>
        </p>
      </div>
    </AuthLayout>
  )
}