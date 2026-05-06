'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setForm({ name: '', email: '', subject: '', message: '' })
    toast({ title: 'Message sent!', description: "We'll get back to you within 1–2 business days." })
  }

  return (
    <div className="container max-w-4xl py-16">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {[
            { icon: Mail, label: 'Email', value: 'support@shopnext.com' },
            { icon: Phone, label: 'Phone', value: '+1 (555) 000-0000' },
            { icon: MapPin, label: 'Address', value: '123 Commerce St, New York, NY 10001' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Message</Label>
                <Textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
