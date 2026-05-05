import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { ChevronDown, MapPin, Calendar, Briefcase } from "lucide-react"
import { api } from "@/lib/api"

type ExpItemRaw = {
  id:number; name:string; company_name:string; description:string
  technologies:string[]; work_type:string; location:string
  start_date?:string; end_date?:string; is_current?:boolean
}
type ExpSummary = { exp_years:number; project_count:number }

interface ExpItem {
  id:number; title:string; company:string; type:string
  duration:string; location:string; description:string; technologies:string[]
  current:boolean
}

const TYPE_STYLE: Record<string, { color:string; bg:string; label:string }> = {
  "full-time": { color:"#00ff41", bg:"rgba(0,255,65,.1)",   label:"Full-time" },
  "freelance": { color:"#00d4ff", bg:"rgba(0,212,255,.1)",  label:"Freelance" },
  "contract":  { color:"#ffd060", bg:"rgba(255,208,96,.1)", label:"Contract"  },
  "part-time": { color:"#c084fc", bg:"rgba(192,132,252,.1)",label:"Part-time" },
  "remote":    { color:"#00ff41", bg:"rgba(0,255,65,.1)",   label:"Remote"    },
  "hybrid":    { color:"#00d4ff", bg:"rgba(0,212,255,.1)",  label:"Hybrid"    },
}
const getType = (t:string) => TYPE_STYLE[t] || { color:"#7fba8a", bg:"rgba(127,186,138,.1)", label:t }

export function ExperienceSection() {
  const [items,   setItems]   = useState<ExpItem[]>([])
  const [summary, setSummary] = useState<ExpSummary|null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string|null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      api.get<ExpItemRaw[]>("/experience-item/", { signal:ctrl.signal }),
      api.get<ExpSummary>("/experience/",        { signal:ctrl.signal }),
    ]).then(([ir, sr]) => {
      const mapped: ExpItem[] = (ir.data||[]).map(i => ({
        id: i.id, title: i.name, company: i.company_name,
        type: i.work_type||"full-time", location: i.location||"",
        description: i.description||"", current: !!i.is_current,
        technologies: Array.isArray(i.technologies) ? i.technologies
          : (i.technologies as unknown as string)?.split(",").map(s=>s.trim()).filter(Boolean)||[],
        duration: i.start_date
          ? `${i.start_date} → ${i.is_current ? "Present" : (i.end_date||"Present")}`
          : "",
      }))
      setItems(mapped); setSummary(sr.data)
    }).catch(err => {
      if (err.name==="CanceledError"||err.name==="AbortError") return
      setError("Ma'lumotlarni yuklashda xatolik")
    }).finally(()=>setLoading(false))
    return ()=>ctrl.abort()
  },[])

  const uniqueTechs = new Set(items.flatMap(i=>i.technologies)).size

  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:.08 } } }
  const card    = { hidden:{opacity:0,x:-16}, visible:{opacity:1,x:0,transition:{duration:.45,ease:[.22,1,.36,1]}} }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full" style={{ background:"var(--neon-green)", boxShadow:"0 0 12px rgba(0,255,65,.6)" }} />
        <div>
          <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>// professional experience</div>
          <h2 className="font-[Syne] text-xl font-bold" style={{ color:"var(--text-primary)" }}>Career Timeline</h2>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor:"rgba(0,255,65,.3)", borderTopColor:"var(--neon-green)" }} />
          <span className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>loading experience.log...</span>
        </div>
      )}
      {error && <p className="font-terminal text-xs text-center py-4" style={{ color:"#ff4040" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Timeline list */}
          <motion.div className="relative space-y-3" variants={stagger} initial="hidden" animate="visible">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px hidden md:block"
              style={{ background:"linear-gradient(to bottom, rgba(0,255,65,.3), rgba(0,255,65,.05))" }} />

            {items.map((exp, idx) => {
              const ts = getType(exp.type)
              return (
                <motion.div key={exp.id} variants={card}>
                  <Disclosure>
                    {({ open }) => (
                      <div className="relative">
                        {/* Timeline dot */}
                        <div className="absolute left-3.5 top-5 w-3 h-3 rounded-full hidden md:flex items-center justify-center z-10"
                          style={{ background: exp.current ? "var(--neon-green)" : "var(--bg-elevated)",
                            border:`1px solid ${exp.current ? "var(--neon-green)" : "rgba(0,255,65,.3)"}`,
                            boxShadow: exp.current ? "0 0 8px rgba(0,255,65,.6)" : "none" }} />

                        <div className="md:ml-12 rounded-2xl overflow-hidden transition-all duration-200 gradient-border"
                          style={{ background:"rgba(0,0,0,.35)", border:"1px solid rgba(0,255,65,.1)" }}>
                          {/* Header */}
                          <DisclosureButton className="w-full text-left p-4 focus:outline-none group">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                                  style={{ background:ts.bg, border:`1px solid ${ts.color}30` }}>
                                  <Briefcase size={16} style={{ color:ts.color }} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-[Syne] font-semibold text-sm md:text-base truncate"
                                      style={{ color:"var(--text-primary)" }}>
                                      {exp.title}
                                    </h3>
                                    {exp.current && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-terminal text-[9px]"
                                        style={{ background:"rgba(0,255,65,.1)", border:"1px solid rgba(0,255,65,.3)", color:"var(--neon-green)" }}>
                                        <span className="status-online" style={{ width:5, height:5 }} /> CURRENT
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-terminal text-xs" style={{ color:ts.color }}>{exp.company}</p>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {exp.location && (
                                      <span className="flex items-center gap-1 font-terminal text-[10px]"
                                        style={{ color:"var(--text-muted)" }}>
                                        <MapPin size={10} />{exp.location}
                                      </span>
                                    )}
                                    {exp.duration && (
                                      <span className="flex items-center gap-1 font-terminal text-[10px]"
                                        style={{ color:"var(--text-muted)" }}>
                                        <Calendar size={10} />{exp.duration}
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.5 rounded font-terminal text-[9px]"
                                      style={{ background:ts.bg, color:ts.color }}>
                                      {ts.label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown size={16} className="flex-shrink-0 mt-1 transition-transform duration-200"
                                style={{ color:"var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
                            </div>
                          </DisclosureButton>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {open && (
                              <DisclosurePanel static>
                                <motion.div
                                  initial={{ height:0, opacity:0 }}
                                  animate={{ height:"auto", opacity:1 }}
                                  exit={{ height:0, opacity:0 }}
                                  transition={{ duration:.3, ease:[.22,1,.36,1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1 space-y-3"
                                    style={{ borderTop:"1px solid rgba(0,255,65,.07)" }}>
                                    {exp.description && (
                                      <p className="text-xs leading-relaxed" style={{ color:"var(--text-secondary)" }}>
                                        {exp.description}
                                      </p>
                                    )}
                                    {exp.technologies.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {exp.technologies.map(t => (
                                          <span key={t} className="tag-green">{t}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </DisclosurePanel>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </Disclosure>
                </motion.div>
              )
            })}

            {items.length === 0 && (
              <div className="text-center py-8">
                <span className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>
                  // no experience records found
                </span>
              </div>
            )}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.4, duration:.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4"
            style={{ borderTop:"1px solid rgba(0,255,65,.08)" }}>
            {[
              { v: summary?.exp_years ? `${summary.exp_years}+` : `${items.length}+`, l:"Yillik tajriba", c:"#00ff41" },
              { v: summary?.project_count || items.length,                             l:"Loyihalar",      c:"#00d4ff" },
              { v: uniqueTechs,                                                         l:"Texnologiya",    c:"#ffd060" },
              { v: items.filter(i=>i.current).length || 1,                             l:"Aktiv ish",      c:"#c084fc" },
            ].map(s => (
              <div key={s.l} className="text-center p-3 rounded-xl"
                style={{ background:"rgba(0,0,0,.3)", border:`1px solid ${s.c}15` }}>
                <div className="font-[Syne] text-2xl font-bold"
                  style={{ color:s.c, textShadow:`0 0 12px ${s.c}40` }}>{s.v}</div>
                <div className="font-terminal text-[10px] mt-0.5" style={{ color:"var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
