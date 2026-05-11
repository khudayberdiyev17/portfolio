import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Award, Calendar, CheckCircle, Download } from "lucide-react"
import { normalizeMediaUrl } from "@/lib/api"
import { bootstrapPortfolioData, getPrefetchedData } from "@/lib/preload"

type CertRaw = {
  id: number
  title: string
  description: string
  image: string
  url: string | null
  skills: string[]
  verified: boolean
  verify_url: string | null
  issuer?: string
  issued_date?: string
}

interface Cert {
  id: number
  title: string
  description: string
  image?: string
  fileUrl?: string | null
  skills: string[]
  verified: boolean
  issuer?: string
  issued_date?: string
}

function CertCard({ cert, index }: { cert: Cert; index: number }) {
  const color = index % 2 === 0 ? "#00ff41" : "#00d4ff"
  const bg = index % 2 === 0 ? "rgba(0,255,65,.05)" : "rgba(0,212,255,.05)"
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden gradient-border group"
      style={{ background: "rgba(0,0,0,.4)", border: `1px solid ${color}18` }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, border: `1px solid ${color}25` }}>
            {cert.image ? <img src={cert.image} alt={cert.title} className="w-8 h-8 object-contain rounded-lg" /> : <Award size={20} style={{ color }} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-[Syne] font-semibold text-sm leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>{cert.title}</h3>
            {cert.issuer && <p className="font-terminal text-[11px] mt-0.5 truncate" style={{ color }}>{cert.issuer}</p>}
          </div>
          {cert.verified && (
            <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded font-terminal text-[9px]" style={{ background: "rgba(0,255,65,.1)", border: "1px solid rgba(0,255,65,.25)", color: "var(--neon-green)" }}>
              <CheckCircle size={9} /> OK
            </span>
          )}
        </div>
        <p className="font-terminal text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>{cert.description}</p>
        <div className="flex flex-wrap gap-1">
          {cert.skills.slice(0, 5).map((skill, skillIndex) => (
            <span key={skill} className="px-2 py-0.5 rounded font-terminal text-[9px]" style={{ background: `${skillIndex % 2 === 0 ? "#00ff41" : "#00d4ff"}15`, border: "1px solid rgba(0,255,65,.2)", color: skillIndex % 2 === 0 ? "#00ff41" : "#00d4ff" }}>
              {skill}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(0,255,65,.06)" }}>
          <span className="flex items-center gap-1 font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>
            <Calendar size={10} />{cert.issued_date || "—"}
          </span>
          {cert.fileUrl && (
            <a
              href={cert.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-terminal text-[10px] transition-all hover:scale-105"
              style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}
            >
              <Download size={10} /> Download
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function CertificatesSection() {
  const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    bootstrapPortfolioData()
      .then(() => {
        const data = getPrefetchedData()
        const raw = (data.certificates || []) as CertRaw[]
        const mapped: Cert[] = raw.map((cert) => ({
          id: cert.id,
          title: cert.title,
          description: cert.description,
          image: normalizeMediaUrl(cert.image),
          fileUrl: normalizeMediaUrl(cert.url || ""),
          skills: Array.isArray(cert.skills) ? cert.skills : [],
          verified: !!cert.verified,
          issuer: cert.issuer,
          issued_date: cert.issued_date,
        }))
        setCerts(mapped)
      })
      .catch(() => setError("Sertifikatlar yuklanmadi"))
      .finally(() => setLoading(false))
  }, [])

  const verified = certs.filter((cert) => cert.verified)
  const allSkills = new Set(certs.flatMap((cert) => cert.skills))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ background: "#ffd060", boxShadow: "0 0 12px rgba(255,208,96,.5)" }} />
        <div>
          <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>// certifications.md</div>
          <h2 className="font-[Syne] text-xl font-bold" style={{ color: "var(--text-primary)" }}>Certifications & Achievements</h2>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-10 justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(255,208,96,.3)", borderTopColor: "#ffd060" }} />
          <span className="font-terminal text-xs" style={{ color: "var(--text-muted)" }}>loading certifications...</span>
        </div>
      )}
      {error && <p className="font-terminal text-xs text-center py-4" style={{ color: "#ff4040" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: certs.length, l: "Jami", c: "#ffd060" },
              { v: verified.length, l: "Verified", c: "#00ff41" },
              { v: allSkills.size, l: "Skills", c: "#00d4ff" },
            ].map((stat) => (
              <div key={stat.l} className="text-center p-3 rounded-xl" style={{ background: "rgba(0,0,0,.3)", border: `1px solid ${stat.c}18` }}>
                <div className="font-[Syne] text-2xl font-bold" style={{ color: stat.c }}>{stat.v}</div>
                <div className="font-terminal text-[10px]" style={{ color: "var(--text-muted)" }}>{stat.l}</div>
              </div>
            ))}
          </div>

          {certs.length === 0 ? (
            <div className="text-center py-10">
              <Award size={32} className="mx-auto mb-2" style={{ color: "rgba(255,208,96,.2)" }} />
              <p className="font-terminal text-xs" style={{ color: "var(--text-muted)" }}>// no records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {certs.map((cert, index) => <CertCard key={cert.id} cert={cert} index={index} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
