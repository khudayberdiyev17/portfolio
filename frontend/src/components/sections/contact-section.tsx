import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Send, ExternalLink, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { bootstrapPortfolioData, getPrefetchedData } from "@/lib/preload"

interface SocialLink { platform: string; url: string; icon?: string }

const PLATFORM_STYLE: Record<string, { color: string; bg: string; icon: string }> = {
  github: { color: "#e8ffee", bg: "rgba(232,255,238,.06)", icon: "⌨" },
  telegram: { color: "#00d4ff", bg: "rgba(0,212,255,.08)", icon: "✈" },
  linkedin: { color: "#0077b5", bg: "rgba(0,119,181,.08)", icon: "💼" },
  twitter: { color: "#1da1f2", bg: "rgba(29,161,242,.08)", icon: "🐦" },
  instagram: { color: "#e1306c", bg: "rgba(225,48,108,.08)", icon: "📸" },
  default: { color: "#00ff41", bg: "rgba(0,255,65,.07)", icon: "🔗" },
}

const getPlatform = (name: string) => PLATFORM_STYLE[name?.toLowerCase()] || PLATFORM_STYLE.default

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [location, setLocation] = useState("—")

  useEffect(() => {
    bootstrapPortfolioData().then(() => {
      const data = getPrefetchedData()
      setSocials((data.socials || []) as SocialLink[])
      setLocation((data.about?.location || "—") as string)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      await api.post("/contact/", form)
      setSent(true)
      setForm({ name: "", email: "", subject: "", message: "" })
      setTimeout(() => setSent(false), 5000)
    } catch {
      setError("Xabar yuborishda xatolik. Keyinroq urinib ko'ring.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ background: "#c084fc", boxShadow: "0 0 12px rgba(192,132,252,.6)" }} />
        <div>
          <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>// contact --secure</div>
          <h2 className="font-[Syne] text-xl font-bold" style={{ color: "var(--text-primary)" }}>Establish Connection</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl" style={{ background: "rgba(0,0,0,.5)", border: "1px solid rgba(0,255,65,.12)" }}>
            <div className="font-terminal text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>CONNECTION STATUS</div>
            <div className="space-y-2 font-terminal text-[11px]">
              {[
                { k: "protocol", v: "HTTPS/TLS 1.3" },
                { k: "response", v: "< 24h weekdays" },
                { k: "location", v: location },
                { k: "status", v: "Available", c: "var(--neon-green)" },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between">
                  <span style={{ color: "var(--text-muted)" }}>{row.k}</span>
                  <span style={{ color: row.c || "var(--text-secondary)" }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>

          {socials.length > 0 && (
            <div className="space-y-2">
              <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>// find me online</div>
              {socials.map((social) => {
                const style = getPlatform(social.platform)
                return (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] group"
                    style={{ background: style.bg, border: `1px solid ${style.color}20` }}
                  >
                    <span className="text-base">{style.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-terminal text-xs capitalize" style={{ color: style.color }}>{social.platform}</div>
                    </div>
                    <ExternalLink size={11} style={{ color: "var(--text-muted)" }} />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(0,0,0,.45)", border: "1px solid rgba(192,132,252,.15)" }}>
            <div className="px-4 py-2.5 font-terminal text-[10px]" style={{ background: "rgba(5,10,7,.8)", borderBottom: "1px solid rgba(0,255,65,.08)", color: "var(--text-muted)" }}>
              new-message.enc
            </div>
            {sent ? (
              <motion.div className="flex flex-col items-center justify-center py-16 px-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(0,255,65,.1)", border: "1px solid rgba(0,255,65,.3)" }}>
                  <CheckCircle size={32} style={{ color: "var(--neon-green)" }} />
                </div>
                <h3 className="font-[Syne] font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Xabar yuborildi</h3>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {error && (
                  <div className="px-3 py-2 rounded-lg font-terminal text-[11px]" style={{ background: "rgba(255,64,64,.08)", border: "1px solid rgba(255,64,64,.2)", color: "#ff6060" }}>
                    {error}
                  </div>
                )}
                <input className="terminal-input text-xs" name="name" value={form.name} onChange={handleChange} placeholder="Ismingiz" required />
                <input className="terminal-input text-xs" name="email" type="email" value={form.email} onChange={handleChange} placeholder="siz@example.com" required />
                <input className="terminal-input text-xs" name="subject" value={form.subject} onChange={handleChange} placeholder="Mavzu" required />
                <textarea className="terminal-input text-xs resize-none" name="message" value={form.message} onChange={handleChange} placeholder="Xabaringiz..." required minLength={10} rows={5} />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl font-terminal text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "rgba(192,132,252,.12)", border: "1px solid rgba(192,132,252,.3)", color: "#c084fc" }}
                  >
                    {sending ? "Sending..." : <><Send size={13} />Transmit</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSection
