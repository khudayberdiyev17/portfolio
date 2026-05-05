import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog, DialogPanel, DialogTitle,
  Listbox, ListboxButton, ListboxOption, ListboxOptions,
} from "@headlessui/react"
import { ExternalLink, Github, ChevronDown, X, ChevronLeft, ChevronRight, Code2, Layers } from "lucide-react"
import { api, normalizeMediaUrl } from "@/lib/api"

type ProjectResponse = {
  id:number; title:string; description:string; long_description:string
  technologies:string[]; category:string; demo_gif:string
  github_url:string|null; live_url:string|null; featured:boolean
  images:{ id:number; image:string; caption?:string }[]
}
interface Project {
  id:number; title:string; description:string; longDesc:string
  technologies:string[]; category:string; demoGif:string
  screenshots:string[]; liveUrl:string; githubUrl?:string; featured:boolean
}

const CAT_COLORS: Record<string, { color:string; bg:string }> = {
  "web":         { color:"#00d4ff", bg:"rgba(0,212,255,.1)" },
  "mobile":      { color:"#c084fc", bg:"rgba(192,132,252,.1)" },
  "security":    { color:"#00ff41", bg:"rgba(0,255,65,.1)" },
  "pentest":     { color:"#00ff41", bg:"rgba(0,255,65,.1)" },
  "ctf":         { color:"#ffd060", bg:"rgba(255,208,96,.1)" },
  "tool":        { color:"#00d4ff", bg:"rgba(0,212,255,.1)" },
  "api":         { color:"#c084fc", bg:"rgba(192,132,252,.1)" },
  "other":       { color:"#7fba8a", bg:"rgba(127,186,138,.1)" },
}
const getCat = (c:string) => CAT_COLORS[c?.toLowerCase()] || CAT_COLORS["other"]

/* ── Project Detail Modal ────────────────────────────────────── */
function ProjectModal({ project, onClose }: { project:Project; onClose:()=>void }) {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = project.screenshots.length > 0 ? project.screenshots : (project.demoGif ? [project.demoGif] : [])
  const cat = getCat(project.category)

  return (
    <AnimatePresence>
      <Dialog open onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <motion.div className="fixed inset-0" aria-hidden
          style={{ background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)" }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel as={motion.div}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl relative"
            style={{ background:"var(--bg-deep)", border:"1px solid rgba(0,255,65,.15)",
              boxShadow:"0 0 0 1px rgba(0,255,65,.08), 0 32px 80px rgba(0,0,0,.9)" }}
            initial={{ opacity:0, y:24, scale:.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:16, scale:.97 }}
            transition={{ duration:.3, ease:[.22,1,.36,1] }}
          >
            {/* Titlebar */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3"
              style={{ background:"rgba(5,12,8,.95)", borderBottom:"1px solid rgba(0,255,65,.1)",
                backdropFilter:"blur(20px)" }}>
              <div className="flex gap-1.5">
                <span className="traffic-red" />
                <span className="traffic-yellow" />
                <span className="traffic-green" />
              </div>
              <DialogTitle className="flex-1 font-terminal text-xs truncate"
                style={{ color:"var(--text-muted)" }}>
                ~/projects/{project.title.toLowerCase().replace(/\s+/g,"-")}
              </DialogTitle>
              {project.featured && (
                <span className="tag-green text-[9px]">★ FEATURED</span>
              )}
              <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-[rgba(255,255,255,.05)]"
                style={{ color:"var(--text-muted)" }}>
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Screenshot carousel */}
              {imgs.length > 0 && (
                <div className="relative rounded-xl overflow-hidden aspect-video"
                  style={{ background:"rgba(0,0,0,.6)", border:"1px solid rgba(0,255,65,.1)" }}>
                  <img src={imgs[imgIdx]} alt={project.title}
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 scanlines pointer-events-none" />
                  {imgs.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i-1+imgs.length)%imgs.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all"
                        style={{ background:"rgba(0,0,0,.7)", border:"1px solid rgba(0,255,65,.2)", color:"var(--neon-green)" }}>
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setImgIdx(i => (i+1)%imgs.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all"
                        style={{ background:"rgba(0,0,0,.7)", border:"1px solid rgba(0,255,65,.2)", color:"var(--neon-green)" }}>
                        <ChevronRight size={16} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {imgs.map((_,i) => (
                          <button key={i} onClick={()=>setImgIdx(i)}
                            className="w-1.5 h-1.5 rounded-full transition-all"
                            style={{ background: i===imgIdx ? "var(--neon-green)" : "rgba(255,255,255,.2)" }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Title + Category */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-[Syne] text-xl font-bold" style={{ color:"var(--text-primary)" }}>
                  {project.title}
                </h3>
                <span className="px-2.5 py-1 rounded-lg font-terminal text-xs flex-shrink-0"
                  style={{ background:cat.bg, border:`1px solid ${cat.color}30`, color:cat.color }}>
                  {project.category}
                </span>
              </div>

              {/* Long desc */}
              <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>
                {project.longDesc || project.description}
              </p>

              {/* Tech stack */}
              <div>
                <div className="font-terminal text-[10px] mb-2" style={{ color:"var(--text-muted)" }}>// tech stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map(t => <span key={t} className="tag-green">{t}</span>)}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-2 pt-1">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-terminal text-xs font-medium transition-all hover:scale-105"
                    style={{ background:"rgba(0,255,65,.1)", border:"1px solid rgba(0,255,65,.25)",
                      color:"var(--neon-green)", boxShadow:"0 0 16px rgba(0,255,65,.1)" }}>
                    <ExternalLink size={13} /> Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-terminal text-xs font-medium transition-all hover:scale-105"
                    style={{ background:"rgba(0,212,255,.08)", border:"1px solid rgba(0,212,255,.2)",
                      color:"var(--cyan)" }}>
                    <Github size={13} /> GitHub
                  </a>
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </AnimatePresence>
  )
}

/* ── Main Section ────────────────────────────────────────────── */
export function ProjectsSection() {
  const [projects,  setProjects]  = useState<Project[]>([])
  const [selected,  setSelected]  = useState<Project|null>(null)
  const [catFilter, setCatFilter] = useState("all")
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string|null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    api.get<ProjectResponse[]>("/projects/", { signal:ctrl.signal })
      .then(res => {
        const mapped: Project[] = (res.data||[]).map(p => {
          const techs = Array.isArray(p.technologies)
            ? p.technologies
            : (p.technologies as unknown as string)?.split(",").map(s=>s.trim()).filter(Boolean)||[]
          return {
            id:p.id, title:p.title, description:p.description,
            longDesc:p.long_description||"", technologies:techs,
            category:p.category||"other",
            demoGif:normalizeMediaUrl(p.demo_gif)||"",
            screenshots:p.images?.map(i=>normalizeMediaUrl(i.image)||i.image).filter(Boolean)||[],
            liveUrl:p.live_url||"", githubUrl:p.github_url||undefined,
            featured:p.featured,
          }
        })
        setProjects(mapped)
      })
      .catch(err => { if(err.name!=="CanceledError"&&err.name!=="AbortError") setError("Loyihalar yuklanmadi") })
      .finally(()=>setLoading(false))
    return ()=>ctrl.abort()
  },[])

  const cats = ["all", ...Array.from(new Set(projects.map(p=>p.category)))]
  const visible = catFilter==="all" ? projects : projects.filter(p=>p.category===catFilter)
  const featured = projects.filter(p=>p.featured)

  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:.06 } } }
  const card    = { hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:.4,ease:[.22,1,.36,1]}} }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full" style={{ background:"var(--cyan)", boxShadow:"0 0 12px rgba(0,212,255,.6)" }} />
          <div>
            <div className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>// projects --all</div>
            <h2 className="font-[Syne] text-xl font-bold" style={{ color:"var(--text-primary)" }}>
              {projects.length} Loyihalar
            </h2>
          </div>
        </div>

        {/* HeadlessUI Listbox category filter */}
        {cats.length > 1 && (
          <Listbox value={catFilter} onChange={setCatFilter}>
            <div className="relative w-40">
              <ListboxButton className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-terminal text-xs focus:outline-none transition-all"
                style={{ background:"rgba(0,0,0,.5)", border:"1px solid rgba(0,255,65,.15)", color:"var(--text-secondary)" }}>
                <span>{catFilter === "all" ? "All Projects" : catFilter}</span>
                <ChevronDown size={12} />
              </ListboxButton>
              <ListboxOptions className="absolute right-0 mt-1 w-full rounded-xl py-1 z-20 focus:outline-none"
                style={{ background:"rgba(4,12,7,.97)", border:"1px solid rgba(0,255,65,.2)",
                  boxShadow:"0 16px 40px rgba(0,0,0,.8)", backdropFilter:"blur(20px)" }}>
                {cats.map(c => (
                  <ListboxOption key={c} value={c}
                    className="px-3 py-2 font-terminal text-xs cursor-pointer transition-colors
                      data-[focus]:bg-[rgba(0,255,65,.08)] data-[selected]:text-[--neon-green]"
                    style={{ color:"var(--text-secondary)" }}>
                    {c === "all" ? "All Projects" : c}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-10 justify-center">
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor:"rgba(0,212,255,.3)", borderTopColor:"var(--cyan)" }} />
          <span className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>scanning projects...</span>
        </div>
      )}
      {error && <p className="font-terminal text-xs text-center py-4" style={{ color:"#ff4040" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Featured badge row */}
          {featured.length > 0 && catFilter === "all" && (
            <div className="flex items-center gap-2">
              <span className="tag-green text-[9px]">★ FEATURED</span>
              <span className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>
                {featured.length} ta alohida loyiha
              </span>
            </div>
          )}

          {/* Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            variants={stagger} initial="hidden" animate="visible"
            key={catFilter}
          >
            {visible.map(proj => {
              const cat = getCat(proj.category)
              const thumb = proj.screenshots[0] || proj.demoGif
              return (
                <motion.div key={proj.id} variants={card}>
                  <button
                    onClick={() => setSelected(proj)}
                    className="w-full text-left rounded-2xl overflow-hidden transition-all duration-300
                      hover:scale-[1.02] hover:shadow-2xl gradient-border group focus:outline-none"
                    style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(0,255,65,.1)" }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-36 overflow-hidden"
                      style={{ background:"rgba(0,20,10,.6)" }}>
                      {thumb ? (
                        <img src={thumb} alt={proj.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Code2 size={32} style={{ color:"rgba(0,255,65,.2)" }} />
                        </div>
                      )}
                      <div className="absolute inset-0 scanlines pointer-events-none" />
                      <div className="absolute inset-0"
                        style={{ background:"linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.8) 100%)" }} />
                      {proj.featured && (
                        <span className="absolute top-2 left-2 tag-green text-[9px]">★ FEATURED</span>
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded font-terminal text-[9px]"
                        style={{ background:cat.bg, border:`1px solid ${cat.color}30`, color:cat.color }}>
                        {proj.category}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <h3 className="font-[Syne] font-semibold text-sm group-hover:text-[--neon-green] transition-colors line-clamp-1"
                        style={{ color:"var(--text-primary)" }}>
                        {proj.title}
                      </h3>
                      <p className="font-terminal text-[11px] line-clamp-2" style={{ color:"var(--text-muted)" }}>
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.slice(0,3).map(t => (
                          <span key={t} className="tag-cyan text-[9px]">{t}</span>
                        ))}
                        {proj.technologies.length > 3 && (
                          <span className="tag-green text-[9px]">+{proj.technologies.length-3}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </motion.div>

          {visible.length === 0 && (
            <div className="text-center py-10">
              <Layers size={32} className="mx-auto mb-2" style={{ color:"rgba(0,255,65,.2)" }} />
              <p className="font-terminal text-xs" style={{ color:"var(--text-muted)" }}>
                // no projects in [{catFilter}]
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop:"1px solid rgba(0,255,65,.08)" }}>
            {[
              { v: projects.length, l:"Jami" },
              { v: featured.length, l:"Featured" },
              { v: cats.length-1,   l:"Kategoriya" },
              { v: new Set(projects.flatMap(p=>p.technologies)).size, l:"Texnologiya" },
            ].map(s => (
              <div key={s.l} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background:"rgba(0,0,0,.3)", border:"1px solid rgba(0,255,65,.08)" }}>
                <span className="font-[Syne] font-bold text-sm" style={{ color:"var(--neon-green)" }}>{s.v}</span>
                <span className="font-terminal text-[10px]" style={{ color:"var(--text-muted)" }}>{s.l}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
