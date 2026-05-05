import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, FolderOpen, Award, MessageSquare, Link2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import api from '@/lib/api'
import { Sidebar } from '@/components/Sidebar'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState({ projects: 0, certificates: 0, messages: 0, socials: 0 })
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/login'); return }

    Promise.all([
      api.get('/projects/'),
      api.get('/certificates/'),
      api.get('/social/'),
      api.get('/contact/'),
      api.get('/contact/stats/unread/'),
    ]).then(([p, c, s, m, u]) => {
      setStats({
        projects: p.data.data?.length || 0,
        certificates: c.data.data?.length || 0,
        messages: m.data.data?.length || 0,
        socials: s.data.data?.length || 0,
      })
      setRecentMessages((m.data.data || []).slice(0, 5))
      setUnread(u.data.data?.unread || 0)
    }).catch(() => navigate('/login'))
  }, [navigate])

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FolderOpen, color: 'text-blue-500', to: '/projects' },
    { label: 'Certificates', value: stats.certificates, icon: Award, color: 'text-amber-500', to: '/certificates' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'text-green-500', to: '/contact' },
    { label: 'Social Links', value: stats.socials, icon: Link2, color: 'text-purple-500', to: '/social' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/30 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Overview of your portfolio</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.to)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`rounded-lg p-3 bg-muted ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {unread > 0 && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2">
                  <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">You have {unread} unread message{unread > 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground">Check your inbox for new contact submissions</p>
                </div>
                <button onClick={() => navigate('/contact')} className="text-sm text-primary hover:underline">
                  View
                </button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{msg.name}</p>
                          {!msg.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                        <p className="text-xs mt-1 truncate">{msg.subject || msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">{formatDate(msg.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}