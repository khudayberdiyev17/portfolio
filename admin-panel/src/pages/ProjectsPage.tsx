import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, ImageIcon, Star, Upload, CheckCircle2, X } from 'lucide-react'
import api from '@/lib/api'
import { normalizeMediaPath, resolveMediaUrl } from '@/lib/media'

type ProjectForm = {
  title: string
  description: string
  long_description: string
  technologies: string
  category: string
  live_url: string
  github_url: string
  featured: boolean
  images: string[]
  primary_image: string
}

const MIN_IMAGES = 3

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const { toast } = useToast()

  const emptyForm: ProjectForm = {
    title: '',
    description: '',
    long_description: '',
    technologies: '',
    category: '',
    live_url: '',
    github_url: '',
    featured: false,
    images: [],
    primary_image: '',
  }
  const [form, setForm] = useState<ProjectForm>(emptyForm)

  const fetchProjects = () =>
    api.get('/projects/').then((r) =>
      setProjects(
        (r.data.data || []).map((project: any) => ({
          ...project,
          demo_gif: normalizeMediaPath(project.demo_gif),
          images: Array.isArray(project.images)
            ? project.images.map((img: any) => ({ ...img, image: normalizeMediaPath(img.image) }))
            : [],
        }))
      )
    )

  useEffect(() => {
    fetchProjects()
  }, [])

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = async (project: any) => {
    setLoading(true)
    try {
      const res = await api.get(`/projects/${project.id}/`)
      const p = res.data.data
      const images = (p.images || []).map((img: any) => normalizeMediaPath(img.image)).filter(Boolean)
      const primary = normalizeMediaPath(p.primary_image || p.demo_gif || images[0] || '')
      setEditing(project)
      setForm({
        title: p.title || '',
        description: p.description || '',
        long_description: p.long_description || '',
        technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
        category: p.category || '',
        live_url: p.live_url || '',
        github_url: p.github_url || '',
        featured: !!p.featured,
        images,
        primary_image: primary,
      })
      setDialogOpen(true)
    } catch {
      toast({ title: 'Error', description: 'Failed to load project details', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const uploadProjectImages = async (files: FileList | null) => {
    if (!files?.length) return
    setUploadingImages(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', 'project_screenshot')
        const res = await api.post('/upload/image/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        uploaded.push(normalizeMediaPath(res.data.url))
      }
      setForm((prev) => {
        const merged = Array.from(new Set([...prev.images, ...uploaded]))
        return {
          ...prev,
          images: merged,
          primary_image: prev.primary_image || merged[0] || '',
        }
      })
      toast({ title: `${uploaded.length} image uploaded`, variant: 'success' })
    } catch {
      toast({ title: 'Error', description: 'Failed to upload images', variant: 'error' })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (image: string) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((img) => img !== image)
      const nextPrimary = prev.primary_image === image ? nextImages[0] || '' : prev.primary_image
      return { ...prev, images: nextImages, primary_image: nextPrimary }
    })
  }

  const handleSave = async () => {
    if (form.images.length < MIN_IMAGES) {
      toast({ title: `At least ${MIN_IMAGES} images are required`, variant: 'error' })
      return
    }
    if (!form.primary_image || !form.images.includes(form.primary_image)) {
      toast({ title: 'Select a primary image', variant: 'error' })
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        long_description: form.long_description,
        technologies: form.technologies.split(',').map((s) => s.trim()).filter(Boolean),
        category: form.category,
        live_url: form.live_url,
        github_url: form.github_url,
        featured: form.featured,
        images: form.images.map((img) => normalizeMediaPath(img)),
        primary_image: normalizeMediaPath(form.primary_image),
      }

      if (editing) {
        await api.put(`/projects/${editing.id}/`, payload)
        toast({ title: 'Updated', variant: 'success' })
      } else {
        await api.post('/projects/', payload)
        toast({ title: 'Created', variant: 'success' })
      }

      setDialogOpen(false)
      setForm(emptyForm)
      fetchProjects()
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      toast({ title: 'Error', description: detail || 'Failed to save project', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      await api.delete(`/projects/${deleteId}/`)
      toast({ title: 'Deleted', variant: 'success' })
      setDeleteId(null)
      fetchProjects()
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
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-muted-foreground text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
            </div>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Project</Button>
          </div>

          {projects.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">No projects yet. Create your first!</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((p) => {
                const cardImage = normalizeMediaPath(p.demo_gif || p.images?.[0]?.image || '')
                const imageCount = Array.isArray(p.images) ? p.images.length : 0
                return (
                  <Card key={p.id} className="overflow-hidden">
                    {cardImage ? (
                      <div className="aspect-video bg-muted"><img src={resolveMediaUrl(cardImage)} alt={p.title} className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                        <div className="flex gap-1 shrink-0">
                          {p.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(p.technologies) && p.technologies.slice(0, 3).map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                          {Array.isArray(p.technologies) && p.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{p.technologies.length - 3}</Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">{imageCount} images</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Project' : 'New Project'}
        footer={<Button onClick={handleSave} loading={loading || uploadingImages}>{editing ? 'Update' : 'Create'}</Button>}
      >
        <div className="space-y-3">
          <FormField label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Web App" /></FormField>
          <FormField label="Short Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Long Description"><Textarea rows={4} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} /></FormField>
          <FormField label="Technologies (comma-separated)"><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, FastAPI..." /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Live URL"><Input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} placeholder="https://..." /></FormField>
            <FormField label="GitHub URL"><Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." /></FormField>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Project Images</label>
              <label className="text-xs text-muted-foreground">Min {MIN_IMAGES} images required</label>
            </div>
            <label className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors px-4 py-5 flex items-center justify-center gap-2 text-sm cursor-pointer">
              {uploadingImages ? (
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{uploadingImages ? 'Uploading...' : 'Upload multiple images'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingImages}
                onChange={(e) => uploadProjectImages(e.target.files)}
              />
            </label>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {form.images.map((image, index) => (
                <div key={`${image}-${index}`} className="rounded-lg border overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    <img src={resolveMediaUrl(image)} alt={`Project ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, primary_image: image }))}
                    className="w-full px-2 py-1.5 text-xs flex items-center justify-center gap-1 border-t hover:bg-muted/50 transition-colors"
                  >
                    <CheckCircle2 className={`w-3 h-3 ${form.primary_image === image ? 'text-primary' : 'text-muted-foreground'}`} />
                    {form.primary_image === image ? 'Primary' : 'Set primary'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className={form.images.length >= MIN_IMAGES ? 'text-emerald-600' : 'text-amber-600'}>
              {form.images.length}/{MIN_IMAGES} minimum images
            </span>
            <span className="text-muted-foreground">
              Primary: {form.primary_image ? 'Selected' : 'Not selected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
            <label htmlFor="featured" className="text-sm">Featured project</label>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Project" description="Delete this project and all its images?" loading={loading} />
    </div>
  )
}
