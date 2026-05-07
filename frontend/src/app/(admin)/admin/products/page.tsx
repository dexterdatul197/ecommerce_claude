'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { useCategories } from '@/hooks/useProducts'
import api from '@/lib/api'
import type { Product, ProductImage } from '@/types'

type ProductForm = {
  name: string; description: string; short_description: string; price: string
  compare_price: string; stock: string; sku: string; category_id: string
  status: string; featured: boolean
}

const DEFAULT_FORM: ProductForm = {
  name: '', description: '', short_description: '', price: '', compare_price: '',
  stock: '0', sku: '', category_id: '', status: 'draft', featured: false,
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM)
  const [productImages, setProductImages] = useState<ProductImage[]>([])

  const { data, isLoading } = useQuery<{ data: Product[]; meta: { total: number; last_page: number } }>({
    queryKey: ['admin', 'products', search, page],
    queryFn: () => api.get('/admin/products', { params: { search: search || undefined, page } }).then(r => r.data),
  })

  const { data: catData } = useCategories()
  const categories = catData?.data ?? []

  const saveProduct = useMutation({
    mutationFn: (payload: Partial<ProductForm>) =>
      editing
        ? api.put(`/admin/products/${editing.id}`, payload)
        : api.post('/admin/products', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      if (!editing) {
        // Switch to edit mode so images can be added
        const created: Product = res.data.data
        setEditing(created)
        setProductImages(created.images ?? [])
        toast({ title: 'Product created. You can now add images.' })
      } else {
        setDialogOpen(false)
        setEditing(null)
        setForm(DEFAULT_FORM)
        setProductImages([])
        toast({ title: 'Product updated.' })
      }
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast({ title: 'Product deleted.' }) },
  })

  const uploadImages = useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) => {
      const formData = new FormData()
      files.forEach(f => formData.append('images[]', f))
      return api.post(`/admin/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (res) => {
      const newImages: ProductImage[] = res.data.data
      setProductImages(prev => [...prev, ...newImages])
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast({ title: `${newImages.length} image(s) uploaded.` })
    },
    onError: (err) => toast({ title: 'Upload failed', description: err.message, variant: 'destructive' }),
  })

  const removeImage = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      api.delete(`/admin/products/${productId}/images/${imageId}`),
    onSuccess: (_, { imageId }) => {
      setProductImages(prev => prev.filter(img => img.id !== imageId))
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast({ title: 'Image deleted.' })
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  function openEdit(product: Product) {
    setEditing(product)
    setProductImages(product.images ?? [])
    setForm({
      name: product.name,
      description: product.description ?? '',
      short_description: product.short_description ?? '',
      price: String(product.price),
      compare_price: String(product.compare_price ?? ''),
      stock: String(product.stock),
      sku: product.sku,
      category_id: String(product.category?.id ?? ''),
      status: product.status,
      featured: product.featured,
    })
    setDialogOpen(true)
  }

  function openCreate() {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setProductImages([])
    setDialogOpen(true)
  }

  function update(field: keyof ProductForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const products = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-xs" />
          </div>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0].url} alt={p.name} className="h-10 w-10 rounded object-cover border flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell>
                      <span className={p.stock <= 5 ? 'font-bold text-red-600' : ''}>{p.stock}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getStatusColor(p.status)}`}>{p.status}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.category?.name ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id) }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {meta.last_page}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) { setEditing(null); setForm(DEFAULT_FORM); setProductImages([]) }
        setDialogOpen(open)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={update('name')} />
            </div>
            <div className="space-y-1">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={update('sku')} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectGroup key={c.id}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground">{c.name}</SelectLabel>
                      {c.children && c.children.length > 0
                        ? c.children.map(child => (
                            <SelectItem key={child.id} value={String(child.id)} className="pl-6">
                              {child.name}
                            </SelectItem>
                          ))
                        : <SelectItem value={String(c.id)}>{c.name}</SelectItem>
                      }
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={update('price')} />
            </div>
            <div className="space-y-1">
              <Label>Compare Price ($)</Label>
              <Input type="number" step="0.01" value={form.compare_price} onChange={update('compare_price')} />
            </div>
            <div className="space-y-1">
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={update('stock')} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Short Description</Label>
              <Textarea value={form.short_description} onChange={update('short_description')} rows={2} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={update('description')} rows={4} />
            </div>

            {/* Images — only available after product exists */}
            {editing && (
              <div className="col-span-2 space-y-2">
                <Label>Images</Label>
                <div className="flex flex-wrap gap-2">
                  {productImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt={img.alt ?? ''} className="h-20 w-20 rounded object-cover border" />
                      <button
                        type="button"
                        onClick={() => removeImage.mutate({ productId: editing.id, imageId: img.id })}
                        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 transition-colors">
                    {uploadImages.isPending ? (
                      <span className="text-xs text-muted-foreground">Uploading…</span>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="mt-1 text-xs text-muted-foreground">Add</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploadImages.isPending}
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? [])
                        if (files.length > 0) {
                          uploadImages.mutate({ id: editing.id, files })
                          e.target.value = ''
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Supported: JPG, PNG, WebP — max 5 MB each</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveProduct.mutate(form)} disabled={saveProduct.isPending}>
              {saveProduct.isPending ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
