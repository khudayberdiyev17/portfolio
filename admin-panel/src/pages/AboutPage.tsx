import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ImageUpload'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import api from '@/lib/api'
import { normalizeMediaPath } from '@/lib/media'

export default function AboutPage() {
  const [form, setForm] = useState({
    name: '', shortly_me: '', bio: '', avatar: '', skills: '', cv_url: '', location: '', available_for: '',
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    api.get('/about-me/').then((r) => {
      if (r.data.data) {
        const d = r.data.data
        setForm({
          name: d.name || '',
          shortly_me: d.shortly_me || '',
          bio: d.bio || '',
          avatar: normalizeMediaPath(d.avatar),
          skills: Array.isArray(d.skills) ? d.skills.join(', ') : '',
          cv_url: d.cv_url || '',
          location: d.location || '',
          available_for: d.available_for || '',
        })
      }
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        avatar: normalizeMediaPath(form.avatar),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      }
      await api.post('/about-me/', payload)
      toast({ title: 'Saved', description: 'About section updated', variant: 'success' })
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">About Section</h1>
              <p className="text-muted-foreground text-sm">Manage your bio and profile information</p>
            </div>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tagline</label>
                  <Input value={form.shortly_me} onChange={(e) => setForm({ ...form, shortly_me: e.target.value })} placeholder="Developer & Designer" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Bio</label>
                <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell visitors about yourself..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Location</label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="San Francisco, CA" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Available For</label>
                  <Input value={form.available_for} onChange={(e) => setForm({ ...form, available_for: e.target.value })} placeholder="Freelance, Full-time" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Skills (comma-separated)</label>
                <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Python, React, TypeScript..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">CV/Resume URL</label>
                <Input value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} placeholder="https://..." />
              </div>
              <ImageUpload
                label="Profile Avatar"
                value={form.avatar}
                onChange={(url) => setForm({ ...form, avatar: url })}
                category="avatar"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
