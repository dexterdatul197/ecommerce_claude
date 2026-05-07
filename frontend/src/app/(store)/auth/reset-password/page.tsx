'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const emailParam = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(emailParam)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const resetPassword = useMutation({
    mutationFn: () => api.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation: confirmPassword,
    }),
    onSuccess: () => {
      toast({ title: 'Password reset!', description: 'You can now sign in with your new password.' })
      router.push('/auth/login')
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground">Invalid or missing reset token.</p>
            <Button asChild variant="outline"><Link href="/auth/forgot-password">Request New Link</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!emailParam && (
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <Button
            className="w-full"
            onClick={() => resetPassword.mutate()}
            disabled={!email || !password || password !== confirmPassword || password.length < 8 || resetPassword.isPending}
          >
            {resetPassword.isPending ? 'Resetting…' : 'Reset Password'}
          </Button>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive text-center">Passwords do not match.</p>
          )}
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">Back to Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
