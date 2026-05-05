import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Switch } from "@headlessui/react"
import { Send, Globe, ExternalLink, Clock, Shield, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"

interface SocialLink { platform:string; url:string; icon?:string }

const PLATFORM_STYLE: Record<string, { color:string; bg:string; icon:string }> = {
  github:    { color:"#e8ffee", bg:"rgba(232,255,238,.06)", icon:"⌨" },
  telegram:  { color:"#00d4ff", bg:"rgba(0,212,255,.08)",   icon:"✈" },
  linkedin:  { color:"#0077b5", bg:"rgba(0,119,181,.08)",   icon:"💼" },
  twitter:   { color:"#1da1f2", bg:"rgba(29,161,242,.08)",  icon:"🐦" },
  instagram: { color:"#e1306c", bg:"rgba(225,48,108,.08)",  icon:"📸" },
  youtube:   { color:"#ff0000", bg:"rgba(255,0,0,.06)",     icon:"▶" },
  default:   { color:"#00ff41", bg:"rgba(0,255,65,.07)",    icon:"🔗" },
}
const getPlatform = (p:string) => PLATFORM_STYLE[p?.toLowerCase()] || PLATFORM_STYLE.default

const FIELDS = [
  { key:"name",    label:"Ism",   placeholder:"Ismingiz",        type:"text",  required:true },
  { key:"email",   label:"Email", placeholder:"siz@example.com", type:"email", required:true },
  { key:"subject", label:"Mavzu", placeholder:"Qanday yordam?",  type:"text",  required:true },
]

export function ContactSection() {
  const [form,     setForm]     = useState({ name:"", email:"", subject:"", message:"" })
  const [secure,   setSecure]   = useState(true)   // HeadlessUI Switch demo
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState<string|null>(null)
  const [socials,  setSocials]  = useState<SocialLink[]>([])
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    api.get<SocialLink[]>("/social/").then(r => setSocials(r.data||[])).catch(()=>{})
  },[])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(p=>({...p,[name]:value}))
    if (name==="message") setCharCount(value.length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true); setError(null)
    try {
      await api.post("/contact/", form)
      setSent(true)
      setForm({ name:"", email:"", subject:"", message:"" })
      setCharCount(0)
      setTimeout(()=>setSent(false), 6000)
    } catch (err:unknown) {
      const ax = err as { response?:{ data?:{ detail?:string } } }
      const d = ax?.response?.data?.detail
      setError(d==="Rate limit exceeded"
        ? "⚠ Too many requests. 1 daqiqa kutib, qayta urinib ko'ring."
        : "Xabar yuborishda xatolik. Keyinroq urinib ko'ring.")
    } finally { setSending(false) }
  }

  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:.08 } } }
  const item    = { hidden:{opacity:0,x:-12}, visible:{opacity:1,x:0,transition:{duration:.4,ease:[.22,1,.36,1]}} }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full"
          style={{ background:"#c084fc", boxShadow:"0 0 12px rgba(192,132,252,.6)" }} />
        <div>
          <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>// contact --secure</div>
          <h2 className="font-[Syne] text-xl font-bold" style={{ color:"var(--text-primary)" }}>
            Establish Connection
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── LEFT: info panel ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Terminal status box */}
          <div className="p-4 rounded-2xl"
            style={{ background:"rgba(0,0,0,.5)", border:"1px solid rgba(0,255,65,.12)" }}>
            <div className="font-terminal text-[10px] mb-3 flex items-center gap-1.5"
              style={{ color:"var(--text-muted)" }}>
              <span className="status-online" /> CONNECTION STATUS
            </div>
            <div className="space-y-2 font-terminal text-[11px]">
              {[
                { k:"protocol", v:"HTTPS/TLS 1.3" },
                { k:"response", v:"< 24h weekdays" },
                { k:"location", v:"Toshkent, UZ" },
                { k:"status",   v:"Available ✓",  color:"var(--neon-green)" },
              ].map(r => (
                <div key={r.k} className="flex items-center justify-between">
                  <span style={{ color:"var(--text-muted)" }}>{r.k}</span>
                  <span style={{ color:r.color||"var(--text-secondary)" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="visible">
              <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>// find me online</div>
              {socials.map(s => {
                const st = getPlatform(s.platform)
                return (
                  <motion.a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                    variants={item}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] group"
                    style={{ background:st.bg, border:`1px solid ${st.color}20` }}>
                    <span className="text-base">{st.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-terminal text-xs capitalize" style={{ color:st.color }}>
                        {s.platform}
                      </div>
                    </div>
                    <ExternalLink size={11} style={{ color:"var(--text-muted)" }}
                      className="group-hover:text-[--neon-green] transition-colors" />
                  </motion.a>
                )
              })}
            </motion.div>
          )}

          {/* Info cards */}
          <div className="space-y-2">
            {[
              { icon:<Clock size={14}/>, title:"Javob vaqti", val:"24 soat ichida (ish kunlari)", c:"#00d4ff" },
              { icon:<Shield size={14}/>, title:"Maxfiylik", val:"Ma'lumotlaringiz saqlanmaydi", c:"#00ff41" },
            ].map(c => (
              <div key={c.title} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background:"rgba(0,0,0,.3)", border:`1px solid ${c.c}12` }}>
                <span style={{ color:c.c }}>{c.icon}</span>
                <div>
                  <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>{c.title}</div>
                  <div className="font-terminal text-[11px]" style={{ color:"var(--text-secondary)" }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden"
            style={{ background:"rgba(0,0,0,.45)", border:"1px solid rgba(192,132,252,.15)" }}>
            {/* Titlebar */}
            <div className="flex items-center gap-3 px-4 py-2.5"
              style={{ background:"rgba(5,10,7,.8)", borderBottom:"1px solid rgba(0,255,65,.08)" }}>
              <span className="traffic-red"/><span className="traffic-yellow"/><span className="traffic-green"/>
              <span className="flex-1 font-terminal text-[10px] text-center" style={{ color:"var(--text-muted)" }}>
                new-message.enc
              </span>
              {/* HeadlessUI Switch — secure mode toggle */}
              <div className="flex items-center gap-2">
                <span className="font-terminal text-[9px]" style={{ color:"var(--text-muted)" }}>SECURE</span>
                <Switch checked={secure} onChange={setSecure}
                  className="relative inline-flex h-4 w-8 cursor-pointer rounded-full transition-all focus:outline-none"
                  style={{ background: secure ? "rgba(0,255,65,.4)" : "rgba(255,255,255,.1)",
                    border:`1px solid ${secure ? "rgba(0,255,65,.5)" : "rgba(255,255,255,.1)"}` }}>
                  <span className="inline-block h-3 w-3 rounded-full transition-transform duration-200 mt-0.5"
                    style={{ background: secure ? "var(--neon-green)" : "rgba(255,255,255,.3)",
                      transform: secure ? "translateX(16px)" : "translateX(2px)",
                      boxShadow: secure ? "0 0 6px rgba(0,255,65,.6)" : "none" }} />
                </Switch>
              </div>
            </div>

            {sent ? (
              <motion.div className="flex flex-col items-center justify-center py-16 px-6 text-center"
                initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ duration:.4, ease:[.22,1,.36,1] }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background:"rgba(0,255,65,.1)", border:"1px solid rgba(0,255,65,.3)",
                    boxShadow:"0 0 30px rgba(0,255,65,.15)" }}>
                  <CheckCircle size={32} style={{ color:"var(--neon-green)" }} />
                </div>
                <h3 className="font-[Syne] font-bold text-lg mb-2" style={{ color:"var(--text-primary)" }}>
                  Xabar yuborildi!
                </h3>
                <p className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>
                  // message encrypted & transmitted successfully
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {error && (
                  <div className="px-3 py-2 rounded-lg font-terminal text-[11px]"
                    style={{ background:"rgba(255,64,64,.08)", border:"1px solid rgba(255,64,64,.2)", color:"#ff6060" }}>
                    {error}
                  </div>
                )}

                {/* Input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FIELDS.map(f => (
                    <div key={f.key} className={f.key==="subject" ? "sm:col-span-2" : ""}>
                      <label className="block font-terminal text-[10px] mb-1" style={{ color:"var(--text-muted)" }}>
                        {f.label} {f.required && <span style={{ color:"var(--neon-green)" }}>*</span>}
                      </label>
                      <input
                        name={f.key} type={f.type}
                        value={form[f.key as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        required={f.required}
                        className="terminal-input text-xs"
                      />
                    </div>
                  ))}
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>
                      Xabar <span style={{ color:"var(--neon-green)" }}>*</span>
                    </label>
                    <span className="font-terminal text-[10px]"
                      style={{ color: charCount > 10 ? "var(--neon-green)" : "var(--text-muted)" }}>
                      {charCount}/1000
                    </span>
                  </div>
                  <textarea
                    name="message" value={form.message}
                    onChange={handleChange}
                    placeholder="Loyiha yoki savol haqida yozing..."
                    required minLength={10} maxLength={1000} rows={5}
                    className="terminal-input text-xs resize-none"
                    style={{ minHeight:120 }}
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between gap-3">
                  <p className="font-terminal text-[9px]" style={{ color:"var(--text-muted)" }}>
                    {secure ? "🔒 E2E encrypted mode" : "⚠ Standard mode"}
                  </p>
                  <button type="submit" disabled={sending}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl font-terminal text-xs font-medium
                      transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background:"rgba(192,132,252,.12)", border:"1px solid rgba(192,132,252,.3)",
                      color:"#c084fc", boxShadow:"0 0 16px rgba(192,132,252,.1)" }}>
                    {sending ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                          style={{ borderColor:"rgba(192,132,252,.3)", borderTopColor:"#c084fc" }} />
                        Sending...
                      </>
                    ) : (
                      <><Send size={13} /> Transmit</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="relative rounded-2xl overflow-hidden p-6 text-center"
        style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(0,255,65,.1)" }}
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5, duration:.5 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
          style={{ background:"linear-gradient(90deg, transparent, var(--neon-green), transparent)" }} />
        <p className="font-[Syne] font-bold text-base mb-1" style={{ color:"var(--text-primary)" }}>
          Birgalikda kuchli tizimlar quramiz
        </p>
        <p className="font-terminal text-[11px]" style={{ color:"var(--text-muted)" }}>
          // open for pentest contracts, bug bounty collab, and security consulting
        </p>
      </motion.div>
    </div>
  )
}

export default ContactSection
