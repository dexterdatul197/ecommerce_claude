'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import type { Category } from '@/types'

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data, isLoading } = useQuery<{ data: Category[] }>({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.get('/admin/categories').then(r => r.data),
  })

  const saveCategory = useMutation({
    mutationFn: () => editing ? api.put(`/admin/categories/${editing.id}`, form) : api.post('/admin/categories', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setDialogOpen(false)
      toast({ title: editing ? 'Category updated.' : 'Category created.' })
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }); toast({ title: 'Category deleted.' }) },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const categories = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-muted-foreground line-clamp-1 max-w-xs">{cat.description ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(cat); setForm({ name: cat.name, description: cat.description ?? '' }); setDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm('Delete?')) deleteCategory.mutate(cat.id) }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCategory.mutate()} disabled={saveCategory.isPending}>
              {saveCategory.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
