interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  loading?: boolean
  destructive?: boolean
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmText = 'Delete', loading, destructive = true,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-md text-white transition-colors ${
              destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}