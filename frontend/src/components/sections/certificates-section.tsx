import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Popover, PopoverButton, PopoverPanel,
  TabGroup, TabList, Tab, TabPanels, TabPanel,
} from "@headlessui/react"
import { Award, ExternalLink, CheckCircle, Calendar, Info } from "lucide-react"
import { api, normalizeMediaUrl } from "@/lib/api"

type CertRaw = {
  id:number; title:string; description:string; image:string; url:string|null
  skills:string[]; verified:boolean; verify_url:string|null; issuer?:string; issued_date?:string
}
interface Cert {
  id:number; title:string; description:string; image?:string; url?:string|null
  verifyUrl?:string|null; skills:string[]; verified:boolean; issuer?:string; issued_date?:string
}

const SKILL_COLOR = (i:number) => {
  const cols = ["#00ff41","#00d4ff","#ffd060","#c084fc"]
  return cols[i % cols.length]
}

function CertCard({ cert, index }: { cert:Cert; index:number }) {
  const color = index % 2 === 0 ? "#00ff41" : "#00d4ff"
  const bg    = index % 2 === 0 ? "rgba(0,255,65,.05)" : "rgba(0,212,255,.05)"

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden gradient-border group"
      style={{ background:"rgba(0,0,0,.4)", border:`1px solid ${color}18` }}
      whileHover={{ y:-3, boxShadow:`0 16px 40px rgba(0,0,0,.5), 0 0 20px ${color}10` }}
      transition={{ duration:.25 }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:bg, border:`1px solid ${color}25` }}>
            {cert.image ? (
              <img src={cert.image} alt={cert.title} className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <Award size={20} style={{ color }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-[Syne] font-semibold text-sm leading-tight line-clamp-2"
              style={{ color:"var(--text-primary)" }}>
              {cert.title}
            </h3>
            {cert.issuer && (
              <p className="font-terminal text-[11px] mt-0.5 truncate" style={{ color }}>
                {cert.issuer}
              </p>
            )}
          </div>
          {cert.verified && (
            <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded font-terminal text-[9px]"
              style={{ background:"rgba(0,255,65,.1)", border:"1px solid rgba(0,255,65,.25)", color:"var(--neon-green)" }}>
              <CheckCircle size={9} /> OK
            </span>
          )}
        </div>

        {/* Description */}
        <p className="font-terminal text-[11px] leading-relaxed line-clamp-2"
          style={{ color:"var(--text-muted)" }}>
          {cert.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {cert.skills.slice(0,4).map((sk,i) => (
            <span key={sk} className="px-2 py-0.5 rounded font-terminal text-[9px]"
              style={{ background:`${SKILL_COLOR(i)}10`, border:`1px solid ${SKILL_COLOR(i)}25`, color:SKILL_COLOR(i) }}>
              {sk}
            </span>
          ))}
          {cert.skills.length > 4 && (
            <Popover className="relative">
              <PopoverButton className="px-2 py-0.5 rounded font-terminal text-[9px] focus:outline-none"
                style={{ background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.1)", color:"var(--text-muted)" }}>
                +{cert.skills.length-4} more
              </PopoverButton>
              <PopoverPanel className="absolute bottom-full left-0 mb-1 z-20 p-2 rounded-lg w-48"
                style={{ background:"rgba(4,12,7,.97)", border:"1px solid rgba(0,255,65,.2)",
                  boxShadow:"0 8px 30px rgba(0,0,0,.8)", backdropFilter:"blur(20px)" }}>
                <div className="flex flex-wrap gap-1">
                  {cert.skills.map((sk,i) => (
                    <span key={sk} className="px-1.5 py-0.5 rounded font-terminal text-[9px]"
                      style={{ background:`${SKILL_COLOR(i)}10`, border:`1px solid ${SKILL_COLOR(i)}20`, color:SKILL_COLOR(i) }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </PopoverPanel>
            </Popover>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1" style={{ borderTop:"1px solid rgba(0,255,65,.06)" }}>
          {cert.issued_date ? (
            <span className="flex items-center gap-1 font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>
              <Calendar size={10} />{cert.issued_date}
            </span>
          ) : <span />}

          {(cert.url || cert.verifyUrl) && (
            <a href={cert.verifyUrl||cert.url||"#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-terminal text-[10px] transition-all hover:scale-105"
              style={{ background:`${color}10`, border:`1px solid ${color}25`, color }}>
              <ExternalLink size={10} /> Verify
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function CertificatesSection() {
  const [certs,   setCerts]   = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string|null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    api.get<CertRaw[]>("/certificates/", { signal:ctrl.signal })
      .then(res => {
        const mapped: Cert[] = (res.data||[]).map(c => ({
          id:c.id, title:c.title, description:c.description,
          image:normalizeMediaUrl(c.image),
          url:c.url, verifyUrl:c.verify_url, verified:c.verified,
          issuer:c.issuer, issued_date:c.issued_date,
          skills: Array.isArray(c.skills) ? c.skills
            : (c.skills as unknown as string)?.split(",").map(s=>s.trim()).filter(Boolean)||[],
        }))
        setCerts(mapped)
      })
      .catch(err => { if(err.name!=="CanceledError"&&err.name!=="AbortError") setError("Sertifikatlar yuklanmadi") })
      .finally(()=>setLoading(false))
    return ()=>ctrl.abort()
  },[])

  const verified   = certs.filter(c=>c.verified)
  const unverified = certs.filter(c=>!c.verified)
  const allSkills  = new Set(certs.flatMap(c=>c.skills))

  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:.06 } } }
  const item    = { hidden:{opacity:0,scale:.97}, visible:{opacity:1,scale:1,transition:{duration:.4,ease:[.22,1,.36,1]}} }

  const TABS = [
    { label:"All", count:certs.length, certs },
    { label:"Verified", count:verified.length, certs:verified },
    { label:"Others", count:unverified.length, certs:unverified },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ background:"#ffd060", boxShadow:"0 0 12px rgba(255,208,96,.5)" }} />
        <div>
          <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>// certifications.md</div>
          <h2 className="font-[Syne] text-xl font-bold" style={{ color:"var(--text-primary)" }}>
            Certifications & Achievements
          </h2>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-10 justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor:"rgba(255,208,96,.3)", borderTopColor:"#ffd060" }} />
          <span className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>loading certifications...</span>
        </div>
      )}
      {error && <p className="font-terminal text-xs text-center py-4" style={{ color:"#ff4040" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { v:certs.length,    l:"Jami",      c:"#ffd060" },
              { v:verified.length, l:"Verified",  c:"#00ff41" },
              { v:allSkills.size,  l:"Skills",    c:"#00d4ff" },
            ].map(s => (
              <div key={s.l} className="text-center p-3 rounded-xl"
                style={{ background:"rgba(0,0,0,.3)", border:`1px solid ${s.c}18` }}>
                <div className="font-[Syne] text-2xl font-bold"
                  style={{ color:s.c, textShadow:`0 0 12px ${s.c}40` }}>{s.v}</div>
                <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* HeadlessUI Tabs */}
          <TabGroup>
            <TabList className="flex gap-1 p-1 rounded-xl w-fit"
              style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,208,96,.1)" }}>
              {TABS.map(t => (
                <Tab key={t.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-terminal text-xs focus:outline-none transition-all duration-200
                    data-[selected]:bg-[rgba(255,208,96,.12)] data-[selected]:text-[#ffd060]
                    data-[selected]:shadow-[0_0_10px_rgba(255,208,96,.15)]
                    data-[hover]:bg-[rgba(255,255,255,.04)]"
                  style={{ color:"var(--text-muted)" }}>
                  {t.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[9px]"
                    style={{ background:"rgba(255,255,255,.07)" }}>{t.count}</span>
                </Tab>
              ))}
            </TabList>

            <TabPanels className="mt-4">
              {TABS.map(t => (
                <TabPanel key={t.label}>
                  {t.certs.length === 0 ? (
                    <div className="text-center py-10">
                      <Award size={32} className="mx-auto mb-2" style={{ color:"rgba(255,208,96,.2)" }} />
                      <p className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>
                        // no records found
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                      variants={stagger} initial="hidden" animate="visible"
                    >
                      {t.certs.map((cert, idx) => (
                        <motion.div key={cert.id} variants={item}>
                          <CertCard cert={cert} index={idx} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </>
      )}
    </div>
  )
}
