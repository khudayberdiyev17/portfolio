import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useSpring } from "framer-motion"
import { AboutSection }        from "@/components/sections/about-section"
import { ExperienceSection }   from "@/components/sections/experience-section"
import { ProjectsSection }     from "@/components/sections/projects-section2"
import { CertificatesSection } from "@/components/sections/certificates-section"
import { ContactSection }      from "@/components/sections/contact-section"

/* ─── Matrix Rain ──────────────────────────────────── */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext("2d"); if (!ctx) return
    const CHARS = "アイウエオカキクケコ01アβγδABCDEF0123456789<>/\\{}[]|ΨΩΦ∑∆"
    const FS = 12; let cols: number[] = []; let id: number
    const resize = () => {
      c.width = c.offsetWidth; c.height = c.offsetHeight
      cols = Array(Math.floor(c.width / FS)).fill(Math.random() * c.height / FS | 0)
    }
    const draw = () => {
      ctx.fillStyle = "rgba(2,8,6,0.06)"
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.font = `${FS}px 'JetBrains Mono', monospace`
      cols.forEach((y, i) => {
        const bright = Math.random() > 0.97
        ctx.fillStyle = bright
          ? `rgba(200,255,210,${Math.random() * 0.5 + 0.6})`
          : `rgba(0,${Math.floor(Math.random()*60+160)},${Math.floor(Math.random()*30)},${Math.random()*0.3+0.15})`
        ctx.fillText(CHARS[Math.random() * CHARS.length | 0], i * FS, y * FS)
        if (y * FS > c.height && Math.random() > 0.978) cols[i] = 0
        else cols[i]++
      })
      id = requestAnimationFrame(draw)
    }
    resize(); draw()
    const ro = new ResizeObserver(resize); ro.observe(c)
    return () => { cancelAnimationFrame(id); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />
}

/* ─── Network nodes ────────────────────────────────── */
function NetworkNodes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext("2d"); if (!ctx) return
    interface N { x:number;y:number;vx:number;vy:number;r:number;pulse:number }
    let nodes: N[] = []; let id: number
    const resize = () => {
      c.width = c.offsetWidth; c.height = c.offsetHeight
      nodes = Array.from({length:26}, ()=>({
        x:Math.random()*c.width, y:Math.random()*c.height,
        vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
        r:Math.random()*1.5+.8, pulse:Math.random()*Math.PI*2
      }))
    }
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height)
      nodes.forEach((a,i)=>{
        nodes.slice(i+1).forEach(b=>{
          const d=Math.hypot(a.x-b.x,a.y-b.y)
          if(d<160){
            ctx.strokeStyle=`rgba(0,212,255,${0.12*(1-d/160)})`
            ctx.lineWidth=.8
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke()
          }
        })
        a.pulse += 0.04
        const glow = Math.sin(a.pulse)*0.3+0.5
        ctx.fillStyle=`rgba(0,212,255,${glow*0.5})`
        ctx.beginPath(); ctx.arc(a.x,a.y,a.r*glow+.5,0,Math.PI*2); ctx.fill()
        a.x+=a.vx; a.y+=a.vy
        if(a.x<0||a.x>c.width) a.vx*=-1
        if(a.y<0||a.y>c.height) a.vy*=-1
      })
      id=requestAnimationFrame(draw)
    }
    resize(); draw()
    const ro=new ResizeObserver(resize); ro.observe(c)
    return()=>{ cancelAnimationFrame(id); ro.disconnect() }
  },[])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />
}

/* ─── Typewriter ────────────────────────────────────── */
function Typewriter({ words }: { words: string[] }) {
  const [display, setDisplay] = useState("")
  const [wi, setWi]   = useState(0)
  const [ci, setCi]   = useState(0)
  const [del, setDel] = useState(false)
  useEffect(() => {
    const cur = words[wi]
    const t = setTimeout(()=>{
      if (!del) {
        setDisplay(cur.slice(0,ci+1))
        if (ci+1===cur.length) setTimeout(()=>setDel(true),1800)
        else setCi(c=>c+1)
      } else {
        setDisplay(cur.slice(0,ci-1))
        if (ci-1===0){ setDel(false); setWi(w=>(w+1)%words.length); setCi(0) }
        else setCi(c=>c-1)
      }
    }, del ? 45 : 85)
    return ()=>clearTimeout(t)
  },[ci,del,wi,words])
  return (
    <span className="font-terminal text-[--neon-green]" style={{textShadow:"0 0 12px rgba(0,255,65,.6)"}}>
      {display}<span className="animate-pulse">▌</span>
    </span>
  )
}

/* ─── macOS Dock ────────────────────────────────────── */
const SECTIONS = [
  { id:"about",        label:"O'zim",       icon:"👤", hint:"About Me" },
  { id:"experience",   label:"Tajriba",      icon:"⚡", hint:"Experience" },
  { id:"projects",     label:"Loyihalar",    icon:"🛸", hint:"Projects" },
  { id:"certificates", label:"Sertifikatlar",icon:"🏅", hint:"Certificates" },
  { id:"contact",      label:"Kontakt",      icon:"📡", hint:"Contact" },
]

function DockItem({ item, active, onClick, mouseX }: {
  item: typeof SECTIONS[0]; active: boolean
  onClick: ()=>void; mouseX: number | null
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const dist = useRef(999)

  useEffect(() => {
    if (!ref.current || mouseX === null) { dist.current = 999; return }
    const r = ref.current.getBoundingClientRect()
    dist.current = Math.abs(mouseX - (r.left + r.width/2))
  })

  const scale = useSpring(1, { stiffness: 400, damping: 30 })
  const y     = useSpring(0, { stiffness: 400, damping: 30 })

  useEffect(() => {
    if (mouseX === null) { scale.set(1); y.set(0); return }
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const d = Math.abs(mouseX - (r.left + r.width/2))
    const s = d < 100 ? 1 + (1 - d/100) * 0.65 : 1
    const u = d < 100 ? -(1 - d/100) * 10 : 0
    scale.set(s); y.set(u)
  },[mouseX])

  return (
    <div className="relative flex flex-col items-center group">
      {/* Tooltip */}
      <motion.div
        className="absolute -top-10 px-2.5 py-1 rounded-lg text-xs font-terminal whitespace-nowrap pointer-events-none"
        style={{ background:"rgba(8,20,12,0.95)", border:"1px solid rgba(0,255,65,.2)", color:"#00ff41" }}
        initial={{ opacity:0, y:4 }}
        whileHover={{ opacity:1, y:0 }}
        transition={{ duration:.15 }}
      >
        {item.hint}
      </motion.div>

      <motion.button
        ref={ref}
        onClick={onClick}
        style={{ scale, y }}
        className={`
          relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center
          text-2xl md:text-[26px] transition-all duration-200 cursor-default select-none
          ${active
            ? "bg-[rgba(0,255,65,0.12)] border border-[rgba(0,255,65,0.4)] shadow-[0_0_20px_rgba(0,255,65,.25)]"
            : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(0,255,65,0.07)] hover:border-[rgba(0,255,65,0.2)]"
          }
        `}
      >
        {item.icon}
        {active && (
          <span className="absolute -bottom-[7px] w-1 h-1 rounded-full bg-[--neon-green] shadow-[0_0_6px_rgba(0,255,65,.8)]" />
        )}
      </motion.button>

      <span className="mt-1.5 text-[10px] font-terminal hidden md:block"
        style={{ color: active ? "var(--neon-green)" : "var(--text-muted)", transition:"color .2s" }}>
        {item.label}
      </span>
    </div>
  )
}

function MacDock({ active, onChange }: { active:string; onChange:(s:string)=>void }) {
  const [mouseX, setMouseX] = useState<number|null>(null)
  const dockRef = useRef<HTMLDivElement>(null)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      onMouseMove={e => setMouseX(e.clientX)}
      onMouseLeave={()=>setMouseX(null)}
    >
      <div ref={dockRef} className="dock-bg rounded-[22px] px-4 py-3 flex items-end gap-2 md:gap-3">
        {SECTIONS.map(s => (
          <DockItem key={s.id} item={s} active={active===s.id}
            onClick={()=>onChange(s.id)} mouseX={mouseX} />
        ))}
      </div>
    </div>
  )
}

/* ─── macOS Window Wrapper ──────────────────────────── */
function MacWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="macos-window glass-heavy w-full">
      <div className="macos-titlebar">
        <div className="traffic-red" />
        <div className="traffic-yellow" />
        <div className="traffic-green" />
        <span className="ml-3 font-terminal text-xs" style={{color:"var(--text-muted)"}}>
          {title}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="status-online" />
          <span className="font-terminal text-[10px]" style={{color:"var(--text-muted)"}}>SECURE</span>
        </span>
      </div>
      <div className="p-4 md:p-6 lg:p-8">{children}</div>
    </div>
  )
}

/* ─── Main App ──────────────────────────────────────── */
export default function App() {
  const [section, setSection] = useState("about")
  const [ready, setReady]     = useState(false)

  useEffect(()=>{ setTimeout(()=>setReady(true), 100) }, [])

  const titles: Record<string, string> = {
    about:        "~/portfolio/about-me.sh",
    experience:   "~/portfolio/experience.log",
    projects:     "~/portfolio/projects --all",
    certificates: "~/portfolio/certifications.md",
    contact:      "~/portfolio/contact --secure",
  }

  const roles = ["Middle Pentester","Bug Bounty Hunter","Security Researcher","CTF Player","Red Teamer"]

  const renderSection = () => {
    switch(section){
      case "about":        return <AboutSection />
      case "experience":   return <ExperienceSection />
      case "projects":     return <ProjectsSection />
      case "certificates": return <CertificatesSection />
      case "contact":      return <ContactSection />
      default:             return <AboutSection />
    }
  }

  return (
    <div className="min-h-screen grid-overlay" style={{background:"var(--bg-void)"}}>

      {/* ── Full-page background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <MatrixRain />
        <div className="absolute inset-0">
          <NetworkNodes />
        </div>
        {/* radial vignette */}
        <div className="absolute inset-0"
          style={{background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,65,.04) 0%, transparent 70%)"}} />
        <div className="absolute inset-0"
          style={{background:"linear-gradient(to bottom, rgba(2,8,6,.3) 0%, rgba(2,8,6,.0) 30%, rgba(2,8,6,.0) 70%, rgba(2,8,6,.9) 100%)"}} />
      </div>

      {/* ── Hero ── */}
      <motion.header
        className="relative z-10 pt-14 pb-8 px-4 text-center"
        initial={{opacity:0, y:-20}}
        animate={{opacity: ready?1:0, y: ready?0:-20}}
        transition={{duration:.8, ease:[.22,1,.36,1]}}
      >
        {/* Top status bar */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full font-terminal text-[11px]"
            style={{background:"rgba(0,255,65,0.06)", border:"1px solid rgba(0,255,65,0.18)", color:"var(--neon-green)"}}>
            <span className="status-online" />
            <span>root@samandar:~$ _</span>
          </div>
        </div>

        {/* Name */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-[Syne] font-extrabold tracking-tight mb-3"
          style={{letterSpacing:"-0.02em"}}>
          <span className="glitch"
            data-text="Khudayberdiyev"
            style={{
              background:"linear-gradient(135deg, #e8ffee 30%, #00ff41 60%, #00d4ff 90%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>
            Khudayberdiyev
          </span>
          {" "}
          <span style={{color:"var(--text-secondary)"}}>Samandar</span>
        </h1>

        {/* Role typewriter */}
        <div className="flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl mb-6">
          <span style={{color:"var(--text-muted)"}} className="font-terminal">&gt;&gt;</span>
          <Typewriter words={roles} />
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["Offensive Security","Bug Bounty","Web Pentest","CTF","OSINT","Red Team"].map(t=>(
            <span key={t} className="tag-green">{t}</span>
          ))}
        </div>
      </motion.header>

      {/* ── Content area ── */}
      <main className="relative z-10 container mx-auto px-4 pb-40 max-w-6xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{opacity:0, y:12, scale:.99}}
            animate={{opacity:1, y:0, scale:1}}
            exit={{opacity:0, y:-8, scale:.99}}
            transition={{duration:.35, ease:[.22,1,.36,1]}}
          >
            <MacWindow title={titles[section]}>
              {renderSection()}
            </MacWindow>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── macOS Dock ── */}
      <MacDock active={section} onChange={setSection} />
    </div>
  )
}
