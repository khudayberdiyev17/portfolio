import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'
import { Mail, CheckCircle, Trash2, Eye, Reply } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function ContactPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [viewMsg, setViewMsg] = useState<any>(null)
  const { toast } = useToast()

  const fetchMessages = () => api.get('/contact/').then((r) => setMessages(r.data.data || []))

  useEffect(() => { fetchMessages() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try { await api.delete(`/contact/${deleteId}/`); toast({ title: 'Deleted', variant: 'success' }); setDeleteId(null); fetchMessages() }
    catch { toast({ title: 'Error', variant: 'error' }) }
    finally { setLoading(false) }
  }

  const handleMarkRead = async (msg: any) => {
    try {
      await api.put(`/contact/${msg.id}/`, { is_read: !msg.is_read })
      fetchMessages()
    } catch { toast({ title: 'Error', variant: 'error' }) }
  }

  const unread = messages.filter((m) => !m.is_read).length

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Contact Messages</h1>
              <p className="text-muted-foreground text-sm">{messages.length} total{unread > 0 ? ` · ${unread} unread` : ''}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {messages.length === 0 ? (
                <div className="py-16 text-center">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id} className={!msg.is_read ? 'bg-primary/5' : ''}>
                        <TableCell>{!msg.is_read ? <Badge>New</Badge> : <Badge variant="outline">Read</Badge>}</TableCell>
                        <TableCell className="font-medium">{msg.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{msg.email}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{msg.subject || msg.message}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMsg(msg)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkRead(msg)} title="Toggle read">
                              <CheckCircle className={`w-4 h-4 ${msg.is_read ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(msg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

      {viewMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewMsg(null)} />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Message from {viewMsg.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewMsg(null)}>✕</Button>
            </div>
            <div className="p-4 space-y-3">
              <div><span className="text-xs text-muted-foreground">Email:</span> <a href={`mailto:${viewMsg.email}`} className="text-sm text-primary">{viewMsg.email}</a></div>
              {viewMsg.subject && <div><span className="text-xs text-muted-foreground">Subject:</span> <span className="text-sm">{viewMsg.subject}</span></div>}
              <div><span className="text-xs text-muted-foreground">Date:</span> <span className="text-sm">{formatDate(viewMsg.created_at)}</span></div>
              <div className="p-3 rounded-lg bg-muted text-sm">{viewMsg.message}</div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Message" description="This cannot be undone." loading={loading} />
    </div>
  )
}
