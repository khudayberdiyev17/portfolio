import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { ChevronDown, MapPin, Calendar, Briefcase } from "lucide-react"
import { bootstrapPortfolioData, getPrefetchedData } from "@/lib/preload"

type ExpItemRaw = {
  id: number
  name: string
  company_name: string
  description: string
  technologies: string[]
  work_type: string
  location: string
  start_date?: string
  end_date?: string
  is_current?: boolean
}
type ExpSummary = { exp_years: number; project_count: number }

interface ExpItem {
  id: number
  title: string
  company: string
  type: string
  duration: string
  location: string
  description: string
  technologies: string[]
  current: boolean
}

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  "full-time": { color: "#00ff41", bg: "rgba(0,255,65,.1)", label: "Full-time" },
  freelance: { color: "#00d4ff", bg: "rgba(0,212,255,.1)", label: "Freelance" },
  contract: { color: "#ffd060", bg: "rgba(255,208,96,.1)", label: "Contract" },
  "part-time": { color: "#c084fc", bg: "rgba(192,132,252,.1)", label: "Part-time" },
  remote: { color: "#00ff41", bg: "rgba(0,255,65,.1)", label: "Remote" },
  hybrid: { color: "#00d4ff", bg: "rgba(0,212,255,.1)", label: "Hybrid" },
}

const getType = (type: string) => TYPE_STYLE[type] || { color: "#7fba8a", bg: "rgba(127,186,138,.1)", label: type }

export function ExperienceSection() {
  const [items, setItems] = useState<ExpItem[]>([])
  const [summary, setSummary] = useState<ExpSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    bootstrapPortfolioData()
      .then(() => {
        const data = getPrefetchedData()
        const rawItems = (data.experienceItems || []) as ExpItemRaw[]
        const rawSummary = (data.experienceSummary || null) as ExpSummary | null
        const mapped: ExpItem[] = rawItems.map((item) => ({
          id: item.id,
          title: item.name,
          company: item.company_name,
          type: item.work_type || "full-time",
          location: item.location || "",
          description: item.description || "",
          current: !!item.is_current,
          technologies: Array.isArray(item.technologies) ? item.technologies : [],
          duration: item.start_date ? `${item.start_date} -> ${item.is_current ? "Present" : (item.end_date || "Present")}` : "",
        }))
        setItems(mapped)
        setSummary(rawSummary)
      })
      .catch(() => setError("Ma'lumotlarni yuklashda xatolik"))
      .finally(() => setLoading(false))
  }, [])

  const uniqueTechs = new Set(items.flatMap((item) => item.technologies)).size

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full" style={{ background: "var(--neon-green)", boxShadow: "0 0 12px rgba(0,255,65,.6)" }} />
        <div>
          <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>// professional experience</div>
          <h2 className="font-[Syne] text-xl font-bold" style={{ color: "var(--text-primary)" }}>Career Timeline</h2>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(0,255,65,.3)", borderTopColor: "var(--neon-green)" }} />
          <span className="font-terminal text-xs" style={{ color: "var(--text-muted)" }}>loading experience.log...</span>
        </div>
      )}
      {error && <p className="font-terminal text-xs text-center py-4" style={{ color: "#ff4040" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="space-y-3">
            {items.map((exp) => {
              const type = getType(exp.type)
              return (
                <Disclosure key={exp.id}>
                  {({ open }) => (
                    <div className="rounded-2xl overflow-hidden gradient-border" style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(0,255,65,.1)" }}>
                      <DisclosureButton className="w-full text-left p-4 focus:outline-none group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: type.bg, border: `1px solid ${type.color}30` }}>
                              <Briefcase size={16} style={{ color: type.color }} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-[Syne] font-semibold text-sm md:text-base truncate" style={{ color: "var(--text-primary)" }}>{exp.title}</h3>
                              </div>
                              <p className="font-terminal text-xs" style={{ color: type.color }}>{exp.company}</p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {exp.location && (
                                  <span className="flex items-center gap-1 font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>
                                    <MapPin size={10} />{exp.location}
                                  </span>
                                )}
                                {exp.duration && (
                                  <span className="flex items-center gap-1 font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>
                                    <Calendar size={10} />{exp.duration}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded font-terminal text-[9px]" style={{ background: type.bg, color: type.color }}>
                                  {type.label}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown size={16} className="flex-shrink-0 mt-1 transition-transform duration-200" style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
                        </div>
                      </DisclosureButton>
                      <DisclosurePanel>
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: "1px solid rgba(0,255,65,.07)" }}>
                          {exp.description && (
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{exp.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {exp.technologies.map((tech) => (
                              <span key={tech} className="tag-green">{tech}</span>
                            ))}
                          </div>
                        </motion.div>
                      </DisclosurePanel>
                    </div>
                  )}
                </Disclosure>
              )
            })}
            {items.length === 0 && (
              <div className="text-center py-8">
                <span className="font-terminal text-xs" style={{ color: "var(--text-muted)" }}>// no experience records found</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4" style={{ borderTop: "1px solid rgba(0,255,65,.08)" }}>
            {[
              { v: summary?.exp_years ? `${summary.exp_years}+` : `${items.length}+`, l: "Yillik tajriba", c: "#00ff41" },
              { v: summary?.project_count || items.length, l: "Loyihalar", c: "#00d4ff" },
              { v: uniqueTechs, l: "Texnologiya", c: "#ffd060" },
              { v: items.filter((item) => item.current).length || 1, l: "Aktiv ish", c: "#c084fc" },
            ].map((s) => (
              <div key={s.l} className="text-center p-3 rounded-xl" style={{ background: "rgba(0,0,0,.3)", border: `1px solid ${s.c}15` }}>
                <div className="font-[Syne] text-2xl font-bold" style={{ color: s.c }}>{s.v}</div>
                <div className="font-terminal text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
