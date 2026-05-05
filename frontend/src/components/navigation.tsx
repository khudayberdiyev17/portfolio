import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Menu, X } from "lucide-react"

interface NavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sections = [
  { id: "about", label: "O'zim haqimda", icon: "👋" },
  { id: "experience", label: "Tajriba", icon: "💼" },
  { id: "projects", label: "Loyihalar", icon: "🚀" },
  { id: "certificates", label: "Sertifikatlar", icon: "🏆" },
  { id: "contact", label: "Kontakt", icon: "📧" },
]

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSectionClick = (section: string) => {
    onSectionChange(section)
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-6 z-50 mx-auto w-full px-4 sm:max-w-fit sm:mx-auto sm:px-0">
      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-md border border-border p-2 shadow-lg">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleSectionClick(section.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105",
              activeSection === section.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <span className="mr-2">{section.icon}</span>
            <span className="hidden md:inline">{section.label}</span>
          </Button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between rounded-full bg-card/80 backdrop-blur-md border border-border p-2 shadow-lg">
          <div className="flex-1 text-center">
            <span className="text-sm font-medium text-foreground">Menu</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute left-4 right-4 mt-2 rounded-lg bg-card/95 backdrop-blur-md border border-border shadow-lg overflow-hidden">
            <div className="flex flex-col gap-1 p-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSectionClick(section.id)}
                  className={cn(
                    "justify-start rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 w-full",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="mr-3">{section.icon}</span>
                  {section.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
