'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { User, MapPin, Shield, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { Address, User as UserType } from '@/types'

type AddrForm = { name: string; phone: string; line1: string; line2: string; city: string; state: string; zip: string; country: string; type: 'shipping' | 'billing'; is_default: boolean }
const BLANK_ADDRESS: AddrForm = { name: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US', type: 'shipping', is_default: false }

export default function AccountPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: meData, isLoading: meLoading } = useQuery<{ data: UserType }>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
  })
  const me = meData?.data

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  useEffect(() => {
    if (me) { setName(me.name); setPhone(me.phone ?? '') }
  }, [me])

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [addrDialogOpen, setAddrDialogOpen] = useState(false)
  const [addrForm, setAddrForm] = useState<AddrForm>(BLANK_ADDRESS)

  const { data: addressData, isLoading: addrLoading } = useQuery<{ data: Address[] }>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses').then(r => r.data),
  })
  const addresses = addressData?.data ?? []

  const updateProfile = useMutation({
    mutationFn: () => api.put('/auth/profile', { name, phone: phone || null }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['me'] }); toast({ title: 'Profile updated.' }) },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const changePassword = useMutation({
    mutationFn: () => api.put('/auth/password', { current_password: currentPw, password: newPw, password_confirmation: confirmPw }),
    onSuccess: () => { toast({ title: 'Password changed.' }); setCurrentPw(''); setNewPw(''); setConfirmPw('') },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const createAddress = useMutation({
    mutationFn: () => api.post('/addresses', addrForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setAddrDialogOpen(false)
      setAddrForm(BLANK_ADDRESS)
      toast({ title: 'Address saved.' })
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const setDefault = useMutation({
    mutationFn: (id: number) => api.put(`/addresses/${id}/default`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast({ title: 'Default address updated.' }) },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const deleteAddress = useMutation({
    mutationFn: (id: number) => api.delete(`/addresses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast({ title: 'Address removed.' }) },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  function addrField(field: keyof typeof addrForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setAddrForm(f => ({ ...f, [field]: e.target.value }))
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-6 text-3xl font-bold">My Account</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="mr-1.5 h-4 w-4" />Addresses</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-1.5 h-4 w-4" />Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {meLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input value={me?.email ?? ''} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses */}
        <TabsContent value="addresses">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              <Button size="sm" onClick={() => { setAddrForm(BLANK_ADDRESS); setAddrDialogOpen(true) }}>
                <Plus className="mr-1.5 h-4 w-4" />Add Address
              </Button>
            </div>
            {addrLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
            ) : addresses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">No addresses saved yet.</p>
                  <Button size="sm" className="mt-4" onClick={() => setAddrDialogOpen(true)}>Add your first address</Button>
                </CardContent>
              </Card>
            ) : (
              addresses.map((addr) => (
                <Card key={addr.id}>
                  <CardContent className="flex items-start justify-between p-5">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{addr.name}</p>
                        {addr.is_default && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Default</span>}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">{addr.type}</span>
                      </div>
                      <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.zip} · {addr.country}</p>
                      <p className="text-muted-foreground">{addr.phone}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      {!addr.is_default && (
                        <Button variant="outline" size="sm" onClick={() => setDefault.mutate(addr.id)} disabled={setDefault.isPending}>
                          Set Default
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm('Remove this address?')) deleteAddress.mutate(addr.id) }}>
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
              <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending || !currentPw || !newPw || !confirmPw}>
                {changePassword.isPending ? 'Updating…' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Address Dialog */}
      <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Full Name</Label>
              <Input value={addrForm.name} onChange={addrField('name')} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Phone</Label>
              <Input value={addrForm.phone} onChange={addrField('phone')} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Address Line 1</Label>
              <Input value={addrForm.line1} onChange={addrField('line1')} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Address Line 2 <span className="text-muted-foreground">(optional)</span></Label>
              <Input value={addrForm.line2} onChange={addrField('line2')} />
            </div>
            <div className="space-y-1">
              <Label>City</Label>
              <Input value={addrForm.city} onChange={addrField('city')} />
            </div>
            <div className="space-y-1">
              <Label>State</Label>
              <Input value={addrForm.state} onChange={addrField('state')} />
            </div>
            <div className="space-y-1">
              <Label>ZIP Code</Label>
              <Input value={addrForm.zip} onChange={addrField('zip')} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input value={addrForm.country} onChange={addrField('country')} maxLength={2} placeholder="US" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Type</Label>
              <Select value={addrForm.type} onValueChange={(v: 'shipping' | 'billing') => setAddrForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddrDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createAddress.mutate()} disabled={createAddress.isPending}>
              {createAddress.isPending ? 'Saving…' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
