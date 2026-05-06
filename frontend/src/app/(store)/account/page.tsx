'use client'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { User, MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { Address } from '@/types'

export default function AccountPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const { data: addressData, refetch } = useQuery<{ data: Address[] }>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses').then(r => r.data),
  })
  const addresses = addressData?.data ?? []

  const [name, setName] = useState(session?.user.name ?? '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const updateProfile = useMutation({
    mutationFn: () => api.put('/auth/profile', { name }),
    onSuccess: () => toast({ title: 'Profile updated.' }),
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const changePassword = useMutation({
    mutationFn: () => api.put('/auth/password', { current_password: currentPw, password: newPw, password_confirmation: confirmPw }),
    onSuccess: () => { toast({ title: 'Password changed.' }); setCurrentPw(''); setNewPw(''); setConfirmPw('') },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const deleteAddress = useMutation({
    mutationFn: (id: number) => api.delete(`/addresses/${id}`),
    onSuccess: () => { refetch(); toast({ title: 'Address removed.' }) },
  })

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-6 text-3xl font-bold">My Account</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="mr-1.5 h-4 w-4" />Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={session?.user.email ?? ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader><CardTitle>Shipping Addresses</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 && <p className="text-sm text-muted-foreground">No addresses saved yet.</p>}
              {addresses.map((addr) => (
                <div key={addr.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.name}</p>
                      {addr.is_default && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Default</span>}
                    </div>
                    <p className="text-muted-foreground">{addr.line1}, {addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-muted-foreground">{addr.phone}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteAddress.mutate(addr.id)}>Remove</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Current Password</Label>
                <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
              </div>
              <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Updating…' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
