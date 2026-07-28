import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { Input, Button, FormField } from '../components/ui'
import { changePasswordSchema, type ChangePasswordFormData } from '../features/auth/validation'
import { useChangePassword } from '../features/auth/useAuth'
import { AuthLayout } from '../components/layout/AuthLayout'

export function ChangePasswordPage() {
  const changePassword = useChangePassword()
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: joiResolver(changePasswordSchema),
  })

  const onSubmit = (data: ChangePasswordFormData) => changePassword.mutate(data)

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Change password</h1>
          <p className="text-base text-slate-500">Set a new password for your account.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="New Password" htmlFor="newPassword" error={errors.newPassword}>
            <Input id="newPassword" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" {...register('newPassword')} />
          </FormField>
          <p className="-mt-3 text-xs text-slate-500">Minimum 8 characters</p>
          <Button type="submit" variant="accent" size="lg" className="w-full text-base" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Changing\u2026' : 'Change Password'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
