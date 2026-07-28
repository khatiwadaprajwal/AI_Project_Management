import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { useSearchParams } from 'react-router-dom'
import { Input, Button, FormField } from '../components/ui'
import { verifyOtpSchema, type VerifyOtpFormData } from '../features/auth/validation'
import { useVerifyOtp } from '../features/auth/useAuth'
import { AuthLayout } from '../components/layout/AuthLayout'

export function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const verifyOtp = useVerifyOtp()
  const { register, handleSubmit, formState: { errors } } = useForm<VerifyOtpFormData>({
    resolver: joiResolver(verifyOtpSchema),
  })

  const onSubmit = (data: VerifyOtpFormData) => verifyOtp.mutate({ email, otp: data.otp })

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verify OTP</h1>
          <p className="text-base text-slate-500">
            Code sent to <span className="font-medium text-slate-700">{email}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="OTP Code" htmlFor="otp" error={errors.otp}>
            <Input id="otp" {...register('otp')} maxLength={6} placeholder="000000" />
          </FormField>
          <Button type="submit" variant="accent" size="lg" className="w-full text-base" disabled={verifyOtp.isPending}>
            {verifyOtp.isPending ? 'Verifying\u2026' : 'Verify'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
