'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (res?.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Package className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join ShopNext today</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={form.name} onChange={update('name')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={update('password')} required minLength={8} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="Repeat password" value={form.password_confirmation} onChange={update('password_confirmation')} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm">
          <p className="w-full text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
