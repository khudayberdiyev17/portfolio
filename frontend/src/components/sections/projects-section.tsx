
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { api, normalizeMediaUrl } from "@/lib/api"

type ProjectResponse = {
  id: number
  title: string
  description: string
  technologies: string
  category: string
  demo_gif: string
  screenshots: string
  live_url: string
  github_url: string | null
}

type ProjectImageResponse = {
  id: number
  project: number
  image: string
}

interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: string
  demoGif: string
  screenshots: string[]
  liveUrl: string
  githubUrl?: string
  featured: boolean
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentScreenshot, setCurrentScreenshot] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchProjects() {
      try {
        setLoading(true)

        const [projectsRes, imagesRes] = await Promise.all([
          api.get<ProjectResponse[]>("/projects/", { signal: controller.signal }),
          api.get<ProjectImageResponse[]>("/project-image/", { signal: controller.signal }),
        ])

        const imagesByProject = imagesRes.data.reduce((acc, img) => {
          const key = img.project
          if (!acc[key]) acc[key] = []
          const normalized = normalizeMediaUrl(img.image) || img.image
          acc[key].push(normalized)
          return acc
        }, {} as Record<number, string[]>)

        const mapped: Project[] = projectsRes.data.map((p, idx) => {
          const techs = (p.technologies || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)

          const demoGif = normalizeMediaUrl(p.demo_gif) || p.demo_gif
          const mainScreenshot = normalizeMediaUrl(p.screenshots) || p.screenshots
          const extraScreens = imagesByProject[p.id] || []
          const screenshots = [mainScreenshot, ...extraScreens].filter(Boolean)

          return {
            id: String(p.id),
            title: p.title,
            description: p.description,
            longDescription: p.description, // hozircha bir xil; xohlasang backendga alohida long_description qo'shasan
            technologies: techs,
            category: p.category,
            demoGif: demoGif || screenshots[0],
            screenshots: screenshots.length ? screenshots : [demoGif],
            liveUrl: p.live_url,
            githubUrl: p.github_url || undefined,
            featured: idx < 2, // birinchi 2 projektni "featured" qilamiz
          }
        })

        setProjects(mapped)
        setError(null)
      } catch (err) {
        if ((err as any).name === "CanceledError" || (err as any).name === "AbortError") return
        console.error(err)
        setError("Loyihalarni yuklashda xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
    return () => controller.abort()
  }, [])

  const featuredProjects = projects.filter((p) => p.featured)
  const otherProjects = projects.filter((p) => !p.featured)

  const nextScreenshot = () => {
    if (selectedProject) {
      setCurrentScreenshot((prev) => (prev + 1) % selectedProject.screenshots.length)
    }
  }

  const prevScreenshot = () => {
    if (selectedProject) {
      setCurrentScreenshot(
        (prev) => (prev - 1 + selectedProject.screenshots.length) % selectedProject.screenshots.length,
      )
    }
  }

  const ProjectCard = ({ project, featured = false }: { project: Project; featured?: boolean }) => (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden ${
        featured ? "md:col-span-2" : ""
      }`}
      onClick={() => {
        setSelectedProject(project)
        setCurrentScreenshot(0)
      }}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={project.demoGif || "/placeholder.svg"}
            alt={`${project.title} demo`}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge className="bg-primary text-primary-foreground">{project.category}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-pretty">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.technologies.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary">
            View Details
          </Button>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Featured Projects</h2>
        <p className="text-lg text-muted-foreground text-pretty">
          DRF backend orqali boshqariladigan loyihalarim
        </p>
      </div>

      {loading && <p className="text-center text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="text-center text-red-500 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {/* Featured */}
          <div className="grid md:grid-cols-2 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>

          {/* Others */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-6">Other Projects</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <AnimatePresence>
          {selectedProject && (
            <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-8 sm:p-10 rounded-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedProject.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Demo */}
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={selectedProject.demoGif || "/placeholder.svg"}
                      alt={`${selectedProject.title} demo`}
                      className="w-full max-h-[400px] object-contain rounded-lg"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-semibold mb-2">About This Project</h4>
                    <p className="text-muted-foreground leading-relaxed text-pretty text-sm sm:text-base">
                      {selectedProject.longDescription}
                    </p>
                  </div>

                  {/* Technologies */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Screenshots</h4>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {selectedProject.screenshots.map((screenshot, index) => (
                        <img
                          key={index}
                          src={screenshot || "/placeholder.svg"}
                          alt={`${selectedProject.title} screenshot ${index + 1}`}
                          className={`flex-shrink-0 w-40 h-28 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                            index === currentScreenshot ? "ring-2 ring-primary scale-105" : "hover:scale-105"
                          }`}
                          onClick={() => setCurrentScreenshot(index)}
                        />
                      ))}
                    </div>

                    <div className="relative mt-4">
                      <img
                        src={selectedProject.screenshots[currentScreenshot] || "/placeholder.svg"}
                        alt={`${selectedProject.title} screenshot`}
                        className="w-full max-h-[450px] object-contain rounded-lg transition-all duration-300"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={prevScreenshot}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={nextScreenshot}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild className="flex-1">
                      <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Live Site
                      </a>
                    </Button>
                    {selectedProject.githubUrl && (
                      <Button variant="outline" asChild className="flex-1 bg-transparent">
                        <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                          View Code
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>
    </div>
  )
}

export default ProjectsSection
