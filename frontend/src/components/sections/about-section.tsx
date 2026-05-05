import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react"
import { api, normalizeMediaUrl } from "@/lib/api"

type AboutMe    = { name?:string; skills?:string[]; shortly_me?:string; bio?:string; avatar?:string }
type Education  = { degree?:string; university?:string; start_year?:number; end_year?:number }
type ExpSummary = { exp_years?:number; project_count?:number }
type ExpItem    = { id?:number; name?:string; company_name?:string; technologies?:string[]; start_date?:string; end_date?:string; is_current?:boolean }

const SKILL_COLORS: Record<string, string> = {
  default: "rgba(0,255,65,.08)",
  cyber:   "rgba(0,212,255,.08)",
  gold:    "rgba(255,208,96,.08)",
}

const TABS = ["Profile","Skills","Stats"]

export function AboutSection() {
  const [about,    setAbout]    = useState<AboutMe | null>(null)
  const [edus,     setEdus]     = useState<Education[]>([])
  const [expSum,   setExpSum]   = useState<ExpSummary | null>(null)
  const [expItems, setExpItems] = useState<ExpItem[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.allSettled([
      api.get<AboutMe>("/about-me/",          { signal: ctrl.signal }),
      api.get<Education[]>("/education/",     { signal: ctrl.signal }),
      api.get<ExpSummary>("/experience/",     { signal: ctrl.signal }),
      api.get<ExpItem[]>("/experience-item/", { signal: ctrl.signal }),
    ]).then(([a,e,es,ei]) => {
      if (a.status === "fulfilled")  setAbout(a.value.data)
      if (e.status === "fulfilled")  setEdus(e.value.data || [])
      if (es.status === "fulfilled") setExpSum(es.value.data)
      if (ei.status === "fulfilled") setExpItems(ei.value.data || [])
    }).finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const avatar = normalizeMediaUrl(about?.avatar)
  const skills = about?.skills?.length ? about.skills
    : ["Metasploit","Burp Suite","Nmap","Wireshark","Python","Kali Linux","OWASP","CTF"]

  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:.07 } } }
  const item    = { hidden:{opacity:0,y:12}, visible:{opacity:1,y:0,transition:{duration:.4,ease:[.22,1,.36,1]}} }

  return (
    <div className="space-y-6">
      {/* ── Top: avatar + bio ── */}
      <motion.div
        className="flex flex-col md:flex-row gap-6 items-start"
        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:.5, ease:[.22,1,.36,1] }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden"
            style={{ boxShadow:"0 0 0 1px rgba(0,255,65,.2), 0 0 40px rgba(0,255,65,.08)" }}>
            <img
              src={avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdb1FF8mlWwcJfLXwafeapi3U63BJOp9uvGw&s"}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdb1FF8mlWwcJfLXwafeapi3U63BJOp9uvGw&s" }}
            />
            {/* scan overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none" />
            <div className="absolute inset-0"
              style={{ background:"linear-gradient(180deg,transparent 60%,rgba(0,20,8,.8) 100%)" }} />
          </div>
          {/* Corner accents */}
          {["-top-1 -left-1","- top-1 -right-1","-bottom-1 -left-1","-bottom-1 -right-1"].map((pos,i)=>(
            <span key={i} className={`absolute w-3 h-3 border-[rgba(0,255,65,.5)]`}
              style={{
                top: i<2 ? -4 : "auto", bottom: i>=2 ? -4 : "auto",
                left: i%2===0 ? -4 : "auto", right: i%2===1 ? -4 : "auto",
                borderTopWidth: i<2 ? 1 : 0, borderBottomWidth: i>=2 ? 1 : 0,
                borderLeftWidth: i%2===0 ? 1 : 0, borderRightWidth: i%2===1 ? 1 : 0,
              }} />
          ))}
          {/* Status */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-terminal text-[10px]"
            style={{ background:"rgba(2,8,6,.95)", border:"1px solid rgba(0,255,65,.25)", color:"var(--neon-green)", whiteSpace:"nowrap" }}>
            <span className="status-online" />
            ONLINE
          </div>
        </div>

        {/* Bio */}
        <div className="flex-1 space-y-3 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <span className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>whoami</span>
            <div className="h-px flex-1" style={{ background:"rgba(0,255,65,.1)" }} />
          </div>
          <h2 className="text-xl md:text-2xl font-[Syne] font-bold" style={{ color:"var(--text-primary)" }}>
            {loading ? "..." : (about?.name || "Samandar Khudayberdiyev")}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>
            {loading ? "Yuklanmoqda..." : (about?.shortly_me || about?.bio || "Offensive security mutaxassisi, penetration testing va bug bounty bilan shug'ullanadi.")}
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap gap-3 pt-1">
            {[
              { label:"Tajriba", value: expSum?.exp_years ? `${expSum.exp_years}+ yil` : "—" },
              { label:"Loyihalar", value: expSum?.project_count ? `${expSum.project_count}+` : "—" },
              { label:"Joylashuv", value: "Toshkent, UZ" },
            ].map(s => (
              <div key={s.label} className="px-3 py-1.5 rounded-lg"
                style={{ background:"rgba(0,255,65,.05)", border:"1px solid rgba(0,255,65,.1)" }}>
                <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>{s.label}</div>
                <div className="font-terminal text-xs font-medium" style={{ color:"var(--neon-green)" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── HeadlessUI Tabs ── */}
      <TabGroup>
        <TabList className="flex gap-1 p-1 rounded-xl"
          style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(0,255,65,.1)" }}>
          {TABS.map(t => (
            <Tab key={t} className="flex-1 rounded-lg py-2 font-terminal text-xs outline-none transition-all duration-200
              data-[selected]:bg-[rgba(0,255,65,.12)] data-[selected]:text-[--neon-green]
              data-[selected]:shadow-[0_0_12px_rgba(0,255,65,.15)]
              data-[hover]:bg-[rgba(0,255,65,.05)]"
              style={{ color:"var(--text-muted)" }}>
              {t}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-4">
          {/* Profile */}
          <TabPanel>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              variants={stagger} initial="hidden" animate="visible">
              {[
                { icon:"🎓", label:"Ta'lim", val: edus[0] ? `${edus[0].degree}, ${edus[0].university}` : "—" },
                { icon:"📅", label:"Bitiruv", val: edus[0] ? `${edus[0].start_year} – ${edus[0].end_year||"Hozir"}` : "—" },
                { icon:"💼", label:"Joriy lavozim", val: expItems[0]?.name || "Middle Pentester" },
                { icon:"🏢", label:"Kompaniya", val: expItems[0]?.company_name || "—" },
                { icon:"🌐", label:"Remote", val: "Ha — worldwide" },
                { icon:"🏆", label:"Mavqe", val: "Available for hire" },
              ].map(r => (
                <motion.div key={r.label} variants={item}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl gradient-border"
                  style={{ background:"rgba(0,255,65,.04)", border:"1px solid rgba(0,255,65,.1)" }}>
                  <span className="text-lg">{r.icon}</span>
                  <div>
                    <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>{r.label}</div>
                    <div className="text-xs font-medium" style={{ color:"var(--text-primary)" }}>{r.val}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabPanel>

          {/* Skills */}
          <TabPanel>
            <motion.div className="flex flex-wrap gap-2"
              variants={stagger} initial="hidden" animate="visible">
              {skills.map((sk, i) => {
                const col = i % 3 === 0 ? "#00ff41" : i % 3 === 1 ? "#00d4ff" : "#ffd060"
                const bg  = i % 3 === 0 ? "rgba(0,255,65,.07)" : i % 3 === 1 ? "rgba(0,212,255,.07)" : "rgba(255,208,96,.07)"
                return (
                  <motion.span key={sk} variants={item}
                    className="px-3 py-1.5 rounded-lg font-terminal text-xs cursor-default
                      transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{ background:bg, border:`1px solid ${col}30`, color:col }}>
                    {sk}
                  </motion.span>
                )
              })}
            </motion.div>
          </TabPanel>

          {/* Stats */}
          <TabPanel>
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              variants={stagger} initial="hidden" animate="visible">
              {[
                { n: expSum?.exp_years ? `${expSum.exp_years}+` : "1+",   label:"Yil tajriba",  color:"#00ff41" },
                { n: expSum?.project_count || "10+",                       label:"Loyihalar",    color:"#00d4ff" },
                { n: skills.length,                                         label:"Ko'nikmalar",  color:"#ffd060" },
                { n: "100%",                                                label:"Dedication",   color:"#00ff41" },
              ].map(s => (
                <motion.div key={s.label} variants={item}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl text-center"
                  style={{ background:"rgba(0,0,0,.3)", border:`1px solid ${s.color}20`,
                    boxShadow:`0 0 20px ${s.color}06` }}>
                  <span className="font-[Syne] text-3xl font-extrabold"
                    style={{ color:s.color, textShadow:`0 0 16px ${s.color}50` }}>
                    {s.n}
                  </span>
                  <span className="font-terminal text-[10px] mt-1" style={{ color:"var(--text-muted)" }}>
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* ── Interests row ── */}
      <div className="pt-2 border-t" style={{ borderColor:"rgba(0,255,65,.08)" }}>
        <div className="font-terminal text-[10px] mb-3" style={{ color:"var(--text-muted)" }}>// interests</div>
        <div className="flex flex-wrap gap-2">
          {["CTF challenges","Security research","Open source","Bug bounty","Red teaming","OSINT"].map(i => (
            <span key={i} className="tag-cyan">{i}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
