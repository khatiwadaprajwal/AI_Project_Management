import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Link } from 'react-router-dom'
import { Input, Button, FormField } from '../components/ui'
import { registerSchema, type RegisterFormData } from '../features/auth/validation'
import { useRegister } from '../features/auth/useAuth'
import { AuthLayout } from '../components/layout/AuthLayout'

export function RegisterPage() {
  const register = useRegister()
  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: joiResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => register.mutate(data)

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="text-base text-slate-500">Get started with your workspace.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Name" htmlFor="name" error={errors.name}>
            <Input id="name" placeholder="Your name" {...reg('name')} />
          </FormField>
          <FormField label="Email address" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" placeholder="name@company.com" {...reg('email')} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password}>
            <Input id="password" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" {...reg('password')} />
          </FormField>
          <FormField label="Workspace Name" htmlFor="workspaceName" error={errors.workspaceName}>
            <Input id="workspaceName" placeholder="My Company" {...reg('workspaceName')} />
          </FormField>
          <Button type="submit" variant="accent" size="lg" className="w-full text-base" disabled={register.isPending}>
            {register.isPending ? 'Registering\u2026' : 'Sign up'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
