import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { ImageUpload } from '@/components/ImageUpload'
import { FileUpload } from '@/components/FileUpload'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, CheckCircle, Calendar, Download, ImageIcon } from 'lucide-react'
import api from '@/lib/api'
import { normalizeMediaPath, resolveMediaUrl } from '@/lib/media'

export default function CertificatesPage() {
  const [certs, setCerts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const emptyForm = {
    title: '',
    description: '',
    issuer: '',
    image: '',
    url: '',
    skills: '',
    verified: false,
    verify_url: '',
    issued_date: '',
  }
  const [form, setForm] = useState(emptyForm)

  const fetchCerts = () =>
    api.get('/certificates/').then((r) =>
      setCerts(
        (r.data.data || []).map((cert: any) => ({
          ...cert,
          image: normalizeMediaPath(cert.image),
          url: normalizeMediaPath(cert.url),
        }))
      )
    )

  useEffect(() => {
    fetchCerts()
  }, [])

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (cert: any) => {
    setEditing(cert)
    setForm({
      title: cert.title || '',
      description: cert.description || '',
      issuer: cert.issuer || '',
      image: normalizeMediaPath(cert.image),
      url: normalizeMediaPath(cert.url),
      skills: Array.isArray(cert.skills) ? cert.skills.join(', ') : '',
      verified: !!cert.verified,
      verify_url: cert.verify_url || '',
      issued_date: cert.issued_date || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        image: normalizeMediaPath(form.image),
        url: normalizeMediaPath(form.url),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      }
      if (editing) {
        await api.put(`/certificates/${editing.id}/`, payload)
        toast({ title: 'Updated', variant: 'success' })
      } else {
        await api.post('/certificates/', payload)
        toast({ title: 'Created', variant: 'success' })
      }
      setDialogOpen(false)
      setForm(emptyForm)
      fetchCerts()
    } catch {
      toast({ title: 'Error', description: 'Failed to save certificate', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      await api.delete(`/certificates/${deleteId}/`)
      toast({ title: 'Deleted', variant: 'success' })
      setDeleteId(null)
      fetchCerts()
    } catch {
      toast({ title: 'Error', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Certificates</h1>
              <p className="text-muted-foreground text-sm">{certs.length} certificate{certs.length !== 1 ? 's' : ''}</p>
            </div>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Certificate</Button>
          </div>

          {certs.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">No certificates yet</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {certs.map((cert) => (
                <Card key={cert.id} className="overflow-hidden">
                  {cert.image ? (
                    <div className="aspect-video bg-muted"><img src={resolveMediaUrl(cert.image)} alt={cert.title} className="w-full h-full object-cover" /></div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{cert.title}</h3>
                        <p className="text-xs text-muted-foreground">{cert.issuer || '—'}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {cert.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cert)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(cert.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{cert.description}</p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{cert.issued_date || 'No date'}</span>
                      </div>
                      {cert.url && (
                        <a
                          href={resolveMediaUrl(cert.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(cert.skills) && cert.skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                      {Array.isArray(cert.skills) && cert.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{cert.skills.length - 3}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Certificate' : 'New Certificate'}
        footer={<Button onClick={handleSave} loading={loading}>{editing ? 'Update' : 'Create'}</Button>}
      >
        <div className="space-y-3">
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Issuer"><Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} /></FormField>
          <FormField label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Skills (comma-separated)"><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="AWS, Python..." /></FormField>
          <FormField label="Issued Date"><Input value={form.issued_date} onChange={(e) => setForm({ ...form, issued_date: e.target.value })} placeholder="2023-03" /></FormField>
          <FileUpload label="Certificate File" value={form.url} onChange={(url) => setForm({ ...form, url })} category="certificate" accept=".pdf" />
          <FormField label="Verification URL"><Input value={form.verify_url} onChange={(e) => setForm({ ...form, verify_url: e.target.value })} placeholder="https://..." /></FormField>
          <ImageUpload label="Certificate Image" value={form.image} onChange={(url) => setForm({ ...form, image: url })} category="certificate" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="verified" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="rounded" />
            <label htmlFor="verified" className="text-sm">Verified</label>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Certificate" description="This cannot be undone." loading={loading} />
    </div>
  )
}
