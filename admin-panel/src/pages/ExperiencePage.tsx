import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Briefcase, GraduationCap } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function ExperiencePage() {
  const [summary, setSummary] = useState({ exp_years: 0, project_count: 0 })
  const [items, setItems] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: '', company_name: '', description: '', technologies: '',
    work_type: '', location: '', start_date: '', end_date: '', is_current: false,
  })

  const fetchData = () => {
    Promise.all([api.get('/experience/summary/'), api.get('/experience/items/')]).then(([s, i]) => {
      if (s.data.data) setSummary(s.data.data)
      setItems(i.data.data || [])
    })
  }

  useEffect(() => { fetchData() }, [])

  const openNew = () => { setEditing(null); setForm({ name: '', company_name: '', description: '', technologies: '', work_type: '', location: '', start_date: '', end_date: '', is_current: false }); setDialogOpen(true) }
  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      name: item.name, company_name: item.company_name, description: item.description || '',
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : '',
      work_type: item.work_type || '', location: item.location || '',
      start_date: item.start_date || '', end_date: item.end_date || '',
      is_current: item.is_current,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map((s) => s.trim()).filter(Boolean),
      }
      if (editing) {
        await api.put(`/experience/items/${editing.id}/`, payload)
        toast({ title: 'Updated', variant: 'success' })
      } else {
        await api.post('/experience/items/', payload)
        toast({ title: 'Created', variant: 'success' })
      }
      setDialogOpen(false)
      fetchData()
    } catch {
      toast({ title: 'Error', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      await api.delete(`/experience/items/${deleteId}/`)
      toast({ title: 'Deleted', variant: 'success' })
      setDeleteId(null)
      fetchData()
    } catch {
      toast({ title: 'Error', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSummarySave = async () => {
    try {
      await api.post('/experience/summary/', summary)
      toast({ title: 'Summary saved', variant: 'success' })
    } catch { toast({ title: 'Error', variant: 'error' }) }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Experience</h1>
              <p className="text-muted-foreground text-sm">Manage your work experience</p>
            </div>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Role</Button>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Summary Stats</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-muted-foreground">Years of Experience</label>
                  <Input type="number" min={0} value={summary.exp_years || 0} onChange={(e) => setSummary({ ...summary, exp_years: Number(e.target.value) })} />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-muted-foreground">Projects Completed</label>
                  <Input type="number" min={0} value={summary.project_count || 0} onChange={(e) => setSummary({ ...summary, project_count: Number(e.target.value) })} />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={handleSummarySave}>Save Stats</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Experience Items ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No experience items yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.company_name}</TableCell>
                        <TableCell><Badge variant="outline">{item.work_type || '—'}</Badge></TableCell>
                        <TableCell>{item.is_current ? <Badge>Current</Badge> : <Badge variant="outline">Past</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Experience' : 'New Experience'}
        footer={<Button onClick={handleSave} loading={loading}>{editing ? 'Update' : 'Create'}</Button>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Role" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
            <FormField label="Company" required><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></FormField>
          </div>
          <FormField label="Description"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Technologies (comma-separated)"><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Python..." /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Work Type"><Input value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })} placeholder="remote, onsite..." /></FormField>
            <FormField label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date"><Input value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} placeholder="Jan 2022" /></FormField>
            <FormField label="End Date"><Input value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} placeholder="Dec 2023" disabled={form.is_current} /></FormField>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="current" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked, end_date: e.target.checked ? '' : form.end_date })} className="rounded" />
            <label htmlFor="current" className="text-sm">Currently working here</label>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        description="Are you sure you want to delete this experience? This cannot be undone."
        loading={loading}
      />
    </div>
  )
}
