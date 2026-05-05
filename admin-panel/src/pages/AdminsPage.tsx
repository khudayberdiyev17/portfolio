import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Shield, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({ email: '', password: '', full_name: '', is_active: true })

  const fetchAdmins = () => api.get('/admins/').then((r) => setAdmins(r.data.data || []))
  useEffect(() => { fetchAdmins() }, [])

  const openNew = () => { setEditing(null); setForm({ email: '', password: '', full_name: '', is_active: true }); setDialogOpen(true) }
  const openEdit = (a: any) => { setEditing(a); setForm({ email: a.email, password: '', full_name: a.full_name || '', is_active: a.is_active }); setDialogOpen(true) }

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload: any = { email: form.email, full_name: form.full_name || undefined, is_active: form.is_active }
      if (form.password) payload.password = form.password
      if (editing) { await api.put(`/admins/${editing.id}/`, payload); toast({ title: 'Updated', variant: 'success' }) }
      else { await api.post('/admins/', payload); toast({ title: 'Created', variant: 'success' }) }
      setDialogOpen(false); fetchAdmins()
    } catch (e: any) { toast({ title: 'Error', description: e.response?.data?.detail || 'Failed', variant: 'error' }) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try { await api.delete(`/admins/${deleteId}/`); toast({ title: 'Deleted', variant: 'success' }); setDeleteId(null); fetchAdmins() }
    catch { toast({ title: 'Error', variant: 'error' }) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold">Admin Users</h1><p className="text-muted-foreground text-sm">{admins.length} admin{admins.length !== 1 ? 's' : ''}</p></div>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Admin</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {admins.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No admins</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.email}</TableCell>
                        <TableCell>{a.full_name || '—'}</TableCell>
                        <TableCell>{a.is_superuser ? <Badge><ShieldCheck className="w-3 h-3 mr-1" />Superadmin</Badge> : <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}</TableCell>
                        <TableCell>{a.is_active ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(a.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Admin' : 'New Admin'}
        footer={<Button onClick={handleSave} loading={loading}>{editing ? 'Update' : 'Create'}</Button>}>
        <div className="space-y-3">
          <FormField label="Email" required><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
          <FormField label="Full Name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></FormField>
          <FormField label={editing ? 'New Password (leave blank to keep)' : 'Password'} required={!editing}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? '••••••••' : 'Min 8 characters'} />
          </FormField>
          {editing && <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} label="Active" />}
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Admin" description="This cannot be undone." loading={loading} />
    </div>
  )
}
