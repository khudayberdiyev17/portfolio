import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react"
import { normalizeMediaUrl } from "@/lib/api"
import { bootstrapPortfolioData, getPrefetchedData } from "@/lib/preload"

type AboutMe = {
  name?: string
  skills?: string[]
  shortly_me?: string
  bio?: string
  avatar?: string
  location?: string
  available_for?: string
}
type Education = { degree?: string; university?: string; start_year?: number; end_year?: number }
type ExpSummary = { exp_years?: number; project_count?: number }
type ExpItem = { id?: number; name?: string; company_name?: string }

const TABS = ["Profile", "Skills", "Stats"]

export function AboutSection() {
  const [about, setAbout] = useState<AboutMe | null>(null)
  const [edus, setEdus] = useState<Education[]>([])
  const [expSum, setExpSum] = useState<ExpSummary | null>(null)
  const [expItems, setExpItems] = useState<ExpItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bootstrapPortfolioData()
      .then(() => {
        const data = getPrefetchedData()
        setAbout((data.about || null) as AboutMe | null)
        setEdus((data.education || []) as Education[])
        setExpSum((data.experienceSummary || null) as ExpSummary | null)
        setExpItems((data.experienceItems || []) as ExpItem[])
      })
      .finally(() => setLoading(false))
  }, [])

  const avatar = normalizeMediaUrl(about?.avatar)
  const skills = about?.skills || []

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col md:flex-row gap-6 items-start"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-[rgba(0,255,65,.2)]">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-terminal text-xs text-[var(--text-muted)]">
              no avatar
            </div>
          )}
          <div className="absolute inset-0 scanlines pointer-events-none" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>
            whoami
          </div>
          <h2 className="text-xl md:text-2xl font-[Syne] font-bold" style={{ color: "var(--text-primary)" }}>
            {loading ? "..." : (about?.name || "—")}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {loading ? "loading..." : (about?.shortly_me || about?.bio || "—")}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {[
              { label: "Tajriba", value: expSum?.exp_years ? `${expSum.exp_years}+ yil` : "—" },
              { label: "Loyihalar", value: expSum?.project_count ? `${expSum.project_count}+` : "—" },
              { label: "Joylashuv", value: about?.location || "—" },
            ].map((s) => (
              <div key={s.label} className="px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,255,65,.05)", border: "1px solid rgba(0,255,65,.1)" }}>
                <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                <div className="font-terminal text-xs font-medium" style={{ color: "var(--neon-green)" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <TabGroup>
        <TabList className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(0,255,65,.1)" }}>
          {TABS.map((t) => (
            <Tab
              key={t}
              className="flex-1 rounded-lg py-2 font-terminal text-xs outline-none transition-all duration-200 data-[selected]:bg-[rgba(0,255,65,.12)] data-[selected]:text-[--neon-green]"
              style={{ color: "var(--text-muted)" }}
            >
              {t}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-4">
          <TabPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Ta'lim", val: edus[0] ? `${edus[0].degree || ""} ${edus[0].university || ""}`.trim() : "—" },
                { label: "Bitiruv", val: edus[0] ? `${edus[0].start_year || "—"} - ${edus[0].end_year || "Hozir"}` : "—" },
                { label: "Joriy lavozim", val: expItems[0]?.name || "—" },
                { label: "Kompaniya", val: expItems[0]?.company_name || "—" },
                { label: "Remote", val: about?.location || "—" },
                { label: "Mavqe", val: about?.available_for || "—" },
              ].map((r) => (
                <div key={r.label} className="px-4 py-3 rounded-xl" style={{ background: "rgba(0,255,65,.04)", border: "1px solid rgba(0,255,65,.1)" }}>
                  <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>{r.label}</div>
                  <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{r.val}</div>
                </div>
              ))}
            </div>
          </TabPanel>
          <TabPanel>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && (
                <span className="font-terminal text-xs" style={{ color: "var(--text-muted)" }}>No skills yet</span>
              )}
              {skills.map((skill, i) => {
                const col = i % 3 === 0 ? "#00ff41" : i % 3 === 1 ? "#00d4ff" : "#ffd060"
                return (
                  <span key={skill} className="px-3 py-1.5 rounded-lg font-terminal text-xs" style={{ background: `${col}18`, border: `1px solid ${col}33`, color: col }}>
                    {skill}
                  </span>
                )
              })}
            </div>
          </TabPanel>
          <TabPanel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { n: expSum?.exp_years ? `${expSum.exp_years}+` : "0", label: "Yil tajriba", c: "#00ff41" },
                { n: expSum?.project_count || "0", label: "Loyihalar", c: "#00d4ff" },
                { n: skills.length, label: "Ko'nikmalar", c: "#ffd060" },
                { n: expItems.length, label: "Ish joylar", c: "#c084fc" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(0,0,0,.3)", border: `1px solid ${s.c}22` }}>
                  <div className="font-[Syne] text-2xl font-bold" style={{ color: s.c }}>{s.n}</div>
                  <div className="font-terminal text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}
