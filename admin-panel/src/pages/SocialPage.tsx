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
import { Plus, Pencil, Trash2, Link2 } from 'lucide-react'
import api from '@/lib/api'

export default function SocialPage() {
  const [links, setLinks] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({ platform: '', url: '', icon: '', is_active: true })

  const fetchLinks = () => api.get('/social/').then((r) => setLinks(r.data.data || []))
  useEffect(() => { fetchLinks() }, [])

  const openNew = () => { setEditing(null); setForm({ platform: '', url: '', icon: '', is_active: true }); setDialogOpen(true) }
  const openEdit = (l: any) => { setEditing(l); setForm({ platform: l.platform, url: l.url, icon: l.icon || '', is_active: l.is_active }); setDialogOpen(true) }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (editing) { await api.put(`/social/${editing.id}/`, form); toast({ title: 'Updated', variant: 'success' }) }
      else { await api.post('/social/', form); toast({ title: 'Created', variant: 'success' }) }
      setDialogOpen(false); fetchLinks()
    } catch { toast({ title: 'Error', variant: 'error' }) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try { await api.delete(`/social/${deleteId}/`); toast({ title: 'Deleted', variant: 'success' }); setDeleteId(null); fetchLinks() }
    catch { toast({ title: 'Error', variant: 'error' }) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold">Social Links</h1><p className="text-muted-foreground text-sm">Links shown in your portfolio</p></div>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Link</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {links.length === 0 ? (
                <div className="py-16 text-center">
                  <Link2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No social links yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.platform}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{l.url}</TableCell>
                        <TableCell>{l.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Link' : 'New Link'}
        footer={<Button onClick={handleSave} loading={loading}>{editing ? 'Update' : 'Create'}</Button>}>
        <div className="space-y-3">
          <FormField label="Platform" required><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="GitHub, LinkedIn..." /></FormField>
          <FormField label="URL" required><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://github.com/..." /></FormField>
          <FormField label="Icon Name"><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Github, Linkedin..." /></FormField>
          <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} label="Active" />
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Link" description="This cannot be undone." loading={loading} />
    </div>
  )
}
