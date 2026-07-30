import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { loginUser } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      const { token, data } = res.data
      if (token && data && 'user' in data) {
        setAuth(token, data.user, data.workspaces)
        navigate('/')
      }
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  const errorMsg =
    (mutation.error as { response?: { data?: { message?: string } } })?.response
      ?.data?.message || mutation.error?.message

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back</CardDescription>
          
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              {errorMsg && (
              <Alert variant="destructive">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-muted-foreground">
              No account?{' '}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Register
              </Link>
              
                
             
              
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
