import { useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from './ui/Button'
import api from '@/lib/api'
import { normalizeMediaPath, resolveMediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  category?: string
  accept?: string
}

function getFileName(path?: string): string {
  if (!path) return ''
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

export function FileUpload({
  value,
  onChange,
  label,
  category = 'misc',
  accept = '.pdf,.doc,.docx,.ppt,.pptx',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      const res = await api.post('/upload/file/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(normalizeMediaPath(res.data.url))
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="rounded-lg border p-3 flex items-center justify-between gap-3">
          <a
            href={resolveMediaUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{getFileName(value)}</span>
          </a>
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange('')}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'w-full rounded-lg border-2 border-dashed px-4 py-6 flex items-center justify-center gap-2 text-sm transition-colors',
            'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40',
            uploading && 'opacity-60 cursor-not-allowed'
          )}
        >
          {uploading ? (
            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload certificate file'}</span>
        </button>
      )}
    </div>
  )
}
